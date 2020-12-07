import { Node } from 'unist';
import { Plugin } from 'unified';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import { EmbedDirective } from './directives';
import { markdownToTex } from './processor';
import {
  BlockSubpathResult,
  getLinkpath,
  HeadingSubpathResult,
  resolveSubpath,
  TFile,
} from 'obsidian';
import { ObsidianVFile } from './file';

export const embed: Plugin<[]> = () => embedTransformer;

async function embedTransformer(tree: Node, file: VFile): Promise<void> {
  const promises: Array<Promise<void>> = [];
  visit(
    tree,
    { type: 'textDirective', name: 'embed' },
    (node, index, parent) => {
      const embed = node as EmbedDirective;
      if (parent === undefined)
        throw new Error('found an embed without a parent');
      promises.push(
        resolveEmbed(embed.attributes.target, file).then((newNode) => {
          parent.children[index] = newNode;
        }),
      );
    },
  );

  return Promise.all(promises).then(() => {});
}

async function resolveEmbed(embedTarget: string, vfile: VFile): Promise<Node> {
  const { file, result } = getTarget(embedTarget, vfile as ObsidianVFile);
  const fileData = await file.vault.cachedRead(file);
  const data = fileData.slice(result.start.offset, result.end?.offset);
  return markdownToTex.parse(data);
}

function getTarget(
  embedTarget: string,
  ovfile: ObsidianVFile,
): { file: TFile; result: HeadingSubpathResult | BlockSubpathResult } {
  const { file, metadata } = ovfile.data;
  const path = getLinkpath(embedTarget);
  const target = metadata.getFirstLinkpathDest(path, file.path);
  const subpath = embedTarget.replace(path, '');
  return {
    file: target,
    result: resolveSubpath(metadata.getFileCache(target), subpath),
  };
}

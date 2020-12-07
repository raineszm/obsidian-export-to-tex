import { Node } from 'unist';
import { Transformer, Processor } from 'unified';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import { EmbedDirective } from './directives';
import {
  BlockSubpathResult,
  HeadingSubpathResult,
  parseLinktext,
  resolveSubpath,
  TFile,
} from 'obsidian';
import { ObsidianVFile } from './file';

export function embed(this: Processor): Transformer {
  return async (tree: Node, file: VFile) =>
    await embedTransformer(this, tree, file);
}

async function embedTransformer(
  processor: Processor,
  tree: Node,
  file: VFile,
): Promise<void> {
  const promises: Array<Promise<void>> = [];
  visit(
    tree,
    { type: 'textDirective', name: 'embed' },
    (node, index, parent) => {
      const embed = node as EmbedDirective;
      if (parent === undefined)
        throw new Error('found an embed without a parent');
      promises.push(
        resolveEmbed(processor, embed.attributes.target, file).then(
          (newNode) => {
            parent.children[index] = newNode;
          },
        ),
      );
    },
  );

  return Promise.all(promises).then(() => {});
}

async function resolveEmbed(
  processor: Processor,
  embedTarget: string,
  vfile: VFile,
): Promise<Node> {
  const { file, result } = getTarget(embedTarget, vfile as ObsidianVFile);
  const fileData = await file.vault.cachedRead(file);
  const data = fileData.slice(result.start.offset, result.end?.offset);
  return processor.parse(data);
}

function getTarget(
  embedTarget: string,
  ovfile: ObsidianVFile,
): { file: TFile; result: HeadingSubpathResult | BlockSubpathResult } {
  const { file, metadata } = ovfile.data;
  const { path, subpath } = parseLinktext(embedTarget);
  const target = metadata.getFirstLinkpathDest(path, file.path);
  return {
    file: target,
    result: resolveSubpath(metadata.getFileCache(target), subpath),
  };
}

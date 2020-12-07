import { Node } from 'unist';
import { Plugin } from 'unified';
import { VFile } from 'vfile';
import is from 'unist-util-is';
import flatMap from 'unist-util-flatmap';
import { EmbedDirective } from './directives';
import {
  BlockCache,
  getLinkpath,
  HeadingCache,
  resolveSubpath,
  TFile,
} from 'obsidian';
import { ObsidianVFile } from './file';

export const embed: Plugin<[]> = () => embedTransformer;

function embedTransformer(tree: Node, file: VFile): Node {
  return flatMap(tree, (node) => {
    if (!is(node, { type: 'textDirective', name: 'embed' })) return [node];

    const embed = node as EmbedDirective;
    return resolveEmbed(embed.attributes.target, file);
  });
}

function resolveEmbed(embedTarget: string, vfile: VFile): Node[] {
  const { file, cache } = getTarget(embedTarget, vfile as ObsidianVFile);

  return [];
}

function getTarget(
  embedTarget: string,
  ovfile: ObsidianVFile,
): { file: TFile; cache: BlockCache | HeadingCache } {
  const { file, metadata } = ovfile.data;
  const path = getLinkpath(embedTarget);
  const target = metadata.getFirstLinkpathDest(path, file.path);
  const subpath = embedTarget.replace(path, '');
  return {
    file: target,
    cache: resolveSubpath(metadata.getFileCache(target), subpath),
  };
}

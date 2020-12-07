import { Node } from 'unist';
import { Plugin } from 'unified';
import { VFile } from 'vfile';
import is from 'unist-util-is';
import map from 'unist-util-map';
import { EmbedDirective } from './directives';
import {
  BlockSubpathResult,
  getLinkpath,
  HeadingSubpathResult,
  resolveSubpath,
  TFile,
} from 'obsidian';
import { ObsidianVFile } from './file';

export const embed: Plugin<[]> = () => embedTransformer;

function isEmbedDirective(node: Node): node is EmbedDirective {
  return is(node, { type: 'textDirective', name: 'embed' });
}

function embedTransformer(tree: Node, file: VFile): Node {
  return map(tree, (node) => {
    if (!isEmbedDirective(node)) return node;

    return resolveEmbed(node.attributes.target, file);
  });
}

function resolveEmbed(embedTarget: string, vfile: VFile): Node {
  const { file, cache } = getTarget(embedTarget, vfile as ObsidianVFile);
  return { type: 'promise' };
}

function getTarget(
  embedTarget: string,
  ovfile: ObsidianVFile,
): { file: TFile; cache: HeadingSubpathResult | BlockSubpathResult } {
  const { file, metadata } = ovfile.data;
  const path = getLinkpath(embedTarget);
  const target = metadata.getFirstLinkpathDest(path, file.path);
  const subpath = embedTarget.replace(path, '');
  return {
    file: target,
    cache: resolveSubpath(metadata.getFileCache(target), subpath),
  };
}

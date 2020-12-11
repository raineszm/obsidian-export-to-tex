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
import { log } from './log';

export function embed(this: Processor): Transformer {
  return async (tree: Node, file: VFile) =>
    await embedTransformer(this, tree, file);
}

async function embedTransformer(
  processor: Processor,
  tree: Node,
  file: VFile,
): Promise<void> {
  log.debug('embed resolution step');
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
            log.trace(
              `Adding embed node ${embed.attributes.target} to parent ${parent.type} node at ${index}`,
            );
            parent.children[index] = newNode;
          },
        ),
      );
    },
  );

  return Promise.all(promises).then(() => {
    log.debug('All embeds resolved');
  });
}

async function resolveEmbed(
  processor: Processor,
  embedTarget: string,
  vfile: VFile,
): Promise<Node> {
  log.debug(`Resolving embed "${embedTarget}"`);

  const { file, result } = getTarget(embedTarget, vfile as ObsidianVFile);
  if (result === null) {
    log.warn(`Failed to resolve embed ${embedTarget}`);
    return { type: 'inlineCode', value: `Missing ${embedTarget}` };
  }

  log.debug('Obtained result block', result);
  log.debug(`Reading embedded file ${file.basename}`);

  const fileData = await file.vault.cachedRead(file);

  log.debug(`Extracting block "${embedTarget}"`);

  const data = fileData.slice(result.start.offset, result.end?.offset);

  log.trace(`"${embedTarget}" data:\n${data}`);
  log.debug(`Parsing "${embedTarget}"`);

  const processed = processor.parse(data);

  log.debug(`Parsed "${embedTarget}"`);

  return processed;
}

function getTarget(
  embedTarget: string,
  ovfile: ObsidianVFile,
): { file: TFile; result: HeadingSubpathResult | BlockSubpathResult } {
  const { file, metadata } = ovfile.data;
  const { path, subpath } = parseLinktext(embedTarget);
  log.debug(`"${embedTarget}" parses to "${subpath}" in "${path}`);
  const target = metadata.getFirstLinkpathDest(path, file.path);
  log.debug(`Loading file ${target.name}`);
  return {
    file: target,
    result: resolveSubpath(metadata.getFileCache(target), subpath.trimEnd()),
  };
}

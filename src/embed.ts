import { Node } from 'unist';
import { Processor, Transformer } from 'unified';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import {
  BlockSubpathResult,
  HeadingSubpathResult,
  parseLinktext,
  resolveSubpath,
  TFile,
} from 'obsidian';
import { ObsidianVFile } from './file';
import { log, prefix } from './log';
import { assertEmbedDirective } from './mdastInterfaces';

export function embed(this: Processor): Transformer {
  return async (tree: Node, file: VFile) =>
    await embedTransformer(this, tree, file);
}

async function embedTransformer(
  processor: Processor,
  tree: Node,
  file: VFile,
): Promise<void> {
  log.debug(prefix, 'embed resolution step');
  const promises: Array<Promise<void>> = [];
  visit(
    tree,
    { type: 'textDirective', name: 'embed' },
    (node, index, parent) => {
      assertEmbedDirective(node);

      if (parent === undefined)
        throw new Error('found an embed without a parent');
      promises.push(
        resolveEmbed(processor, node.attributes.target, file).then(
          (newNode) => {
            log.trace(
              prefix,
              `Adding embed node ${node.attributes.target} to parent ${parent.type} node at ${index}`,
            );
            parent.children[index] = newNode;
          },
        ),
      );
    },
  );

  return Promise.all(promises).then(() => {
    log.debug(prefix, 'All embeds resolved');
  });
}

async function resolveEmbed(
  processor: Processor,
  embedTarget: string,
  vfile: VFile,
): Promise<Node> {
  log.debug(prefix, `Resolving embed "${embedTarget}"`);

  const { file, result } = getTarget(embedTarget, vfile as ObsidianVFile);

  if (result === null) {
    log.warn(prefix, `Failed to resolve embed ${embedTarget}`);
    return { type: 'inlineCode', value: `Missing ${embedTarget}` };
  }

  log.debug(prefix, 'Obtained result block', result);
  log.debug(prefix, `Reading embedded file ${file.basename}`);

  const fileData = await file.vault.cachedRead(file);

  log.debug(prefix, `Extracting block "${embedTarget}"`);

  const data = fileData.slice(result.start.offset, result.end?.offset);

  log.trace(prefix, `"${embedTarget}" data:\n${data}`);
  log.debug(prefix, `Parsing "${embedTarget}"`);

  const processed = processor.parse(data);

  log.debug(prefix, `Parsed "${embedTarget}"`);

  return processed;
}

function getTarget(
  embedTarget: string,
  ovfile: ObsidianVFile,
): { file: TFile; result: HeadingSubpathResult | BlockSubpathResult } {
  const { file, metadata } = ovfile.data;
  const { path, subpath } = parseLinktext(embedTarget);

  log.debug(prefix, `"${embedTarget}" parses to "${subpath}" in "${path}`);

  const target = metadata.getFirstLinkpathDest(path, file.path);

  log.debug(prefix, `Loading file ${target.name}`);

  return {
    file: target,
    result: resolveSubpath(metadata.getFileCache(target), subpath.trimEnd()),
  };
}

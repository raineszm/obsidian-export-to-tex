import { Node } from 'unist';
import { Processor, Transformer } from 'unified';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import {
  BlockSubpathResult,
  HeadingSubpathResult,
  MetadataCache,
  parseLinktext,
  resolveSubpath,
  TFile,
} from 'obsidian';
import { log, prefix } from './log';
import { assertEmbedDirective } from './mdastInterfaces';
import { assertVFileData, makeVFile } from './file';

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
  parentFile: VFile,
): Promise<Node> {
  log.debug(prefix, `Resolving embed "${embedTarget}"`);
  const metadata = processor.data('metadata');
  if (!(metadata instanceof MetadataCache)) {
    throw Error(
      'metadata must be passed to the processor in the form of an obsidian MetadataCache',
    );
  }

  const { file, result, subpath } = getTarget(
    embedTarget,
    parentFile,
    metadata,
  );

  if (result === null) {
    parentFile.message(`Failed to resolve embed ${embedTarget}`);
    return { type: 'inlineCode', value: `Missing ${embedTarget}` };
  }

  parentFile.info(`Reading embedded file ${file.basename}`);

  const fileData = await file.vault.cachedRead(file);

  log.debug(prefix, `Extracting block "${embedTarget}"`);

  const data = fileData.slice(result.start.offset, result.end?.offset);

  parentFile.info(`Parsing "${embedTarget}"`);

  const embedFile = makeVFile(data, file.path, subpath);
  const processed = processor.parse(embedFile);
  assertVFileData(parentFile.data);
  parentFile.data.embedded.push(embedFile);

  return processed;
}

function getTarget(
  embedTarget: string,
  file: VFile,
  metadata: MetadataCache,
): {
  file: TFile;
  result: HeadingSubpathResult | BlockSubpathResult;
  subpath: string;
} {
  const { path, subpath } = parseLinktext(embedTarget);

  log.debug(prefix, `"${embedTarget}" parses to "${subpath}" in "${path}`);
  if (file.path === undefined) {
    throw new Error(
      `cannot result target of link ${embedTarget} as the path of the embedding file is not available`,
    );
  }

  const target = metadata.getFirstLinkpathDest(path, file.path);

  log.debug(prefix, `Loading file ${target.name}`);

  return {
    file: target,
    subpath,
    result: resolveSubpath(metadata.getFileCache(target), subpath.trimEnd()),
  };
}

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
import { assertEmbedDirective, EmbedDirective } from './mdastInterfaces';
import { makeVFile } from './file';

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
      assertEmbedDirective(node);

      if (parent === undefined)
        throw new Error('found an embed without a parent');
      promises.push(
        resolveEmbed(processor, node, file).then((newNode) => {
          parent.children[index] = newNode;
        }),
      );
    },
  );

  return Promise.all(promises).then(() => {
    file.info('All embeds resolved', tree);
  });
}

async function resolveEmbed(
  processor: Processor,
  node: EmbedDirective,
  parentFile: VFile,
): Promise<Node> {
  const embedTarget = node.attributes.target;
  parentFile.info(`Resolving embed "${embedTarget}"`, node);

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
    parentFile.message(`Failed to resolve embed ${embedTarget}`, node);
    return { type: 'inlineCode', value: `Missing ${embedTarget}` };
  }

  parentFile.info(`Reading embedded file ${file.basename}`, node);

  const fileData = await file.vault.cachedRead(file);

  const data = fileData.slice(result.start.offset, result.end?.offset);

  parentFile.info(`Parsing "${embedTarget}"`, node);

  const embedFile = makeVFile(data, file.path, subpath);
  const processed = processor.parse(embedFile);
  parentFile.messages.push(...embedFile.messages);

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

  if (file.path === undefined) {
    throw new Error(
      `cannot result target of link ${embedTarget} as the path of the embedding file is not available`,
    );
  }

  const target = metadata.getFirstLinkpathDest(path, file.path);

  return {
    file: target,
    subpath,
    result: resolveSubpath(metadata.getFileCache(target), subpath.trimEnd()),
  };
}

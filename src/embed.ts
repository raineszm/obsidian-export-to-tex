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
        resolveEmbed(processor, node, file)
          .then((newNode) => {
            parent.children[index] = newNode;
          })
          .catch((reason) => {
            file.message(reason, node, 'embed:error');
            parent.children[index] = failedEmbed(file, node);
          }),
      );
    },
  );

  return Promise.allSettled(promises).then(() => {
    file.info('All embeds resolved', tree);
  });
}

function failedEmbed(parentFile: VFile, node: EmbedDirective): Node {
  const embedTarget = node.attributes.target;
  parentFile.message(`Failed to resolve embed ${embedTarget}`, node);
  return { type: 'inlineCode', value: `Missing ${embedTarget}` };
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

  const { file, result, subpath } = getTarget(node, parentFile, metadata);

  if (result === null || file === undefined) {
    return failedEmbed(parentFile, node);
  }

  parentFile.info(`Reading embedded file ${file.basename}`, node);
  if (!(await file.vault.adapter.exists(file.path))) {
    parentFile.message(`${file.basename} does not exists`, node);
    return failedEmbed(parentFile, node);
  }

  const fileData = await file.vault.cachedRead(file);

  const data = fileData.slice(result.start.offset, result.end?.offset);

  parentFile.info(`Parsing "${embedTarget}"`, node);

  const embedFile = makeVFile(data, file.path, subpath);
  const processed = processor.parse(embedFile);
  parentFile.messages.push(...embedFile.messages);

  return processed;
}

const FAILED_TARGET = {
  subpath: '',
  result: null,
};

function getTarget(
  node: EmbedDirective,
  file: VFile,
  metadata: MetadataCache,
): {
  file?: TFile;
  result: HeadingSubpathResult | BlockSubpathResult | null;
  subpath: string;
} {
  const embedTarget = node.attributes.target;
  const { path, subpath } = parseLinktext(embedTarget);

  if (file.path === undefined) {
    file.message(
      `cannot resolve target of link ${embedTarget} as the path of the embedding file is not available`,
      node,
    );
    return FAILED_TARGET;
  }

  const target = metadata.getFirstLinkpathDest(path, file.path);
  if (target === null) {
    file.message(`cannot resolve target of link ${embedTarget}`, node);
    return FAILED_TARGET;
  }
  const cache = metadata.getFileCache(target);
  if (cache === null) {
    file.message(`cannot access file cache of ${embedTarget}`, node);
    return FAILED_TARGET;
  }

  return {
    file: target,
    subpath,
    result: resolveSubpath(cache, subpath.trimEnd()),
  };
}

import { Node, Parent } from 'unist';
import { Processor, Transformer } from 'unified';
import { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import { assertEmbedDirective } from './embedDirective';
import { EmbedResolver } from './embedResolver';

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
    (node: Node, index, parent?: Parent) => {
      assertEmbedDirective(node);

      if (parent === undefined)
        throw new Error('found an embed without a parent');

      const resolver = new EmbedResolver(processor, file, node);
      promises.push(
        resolver
          .resolve()
          .then((newNode) => {
            parent.children[index] = newNode;
          })
          .catch((reason) => {
            file.message(reason, node, 'embed:error');
            parent.children[index] = resolver.failedEmbed();
          }),
      );
    },
  );

  return await Promise.allSettled(promises).then(() => {
    file.info('All embeds resolved', tree);
  });
}

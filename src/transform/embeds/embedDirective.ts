import { convert } from 'unist-util-is';
import { TextDirective } from 'mdast-util-directive';
import { Node } from 'unist';
import { throwWrongNode } from '../../nodeTypeHelpers';

export interface EmbedDirective extends TextDirective {
  name: 'embed';
  attributes: {
    target: string;
  };
}

export const isEmbedDirective = convert<EmbedDirective>({
  type: 'textDirective',
  name: 'embed',
});

export function assertEmbedDirective(
  node: Node,
): asserts node is EmbedDirective {
  if (!isEmbedDirective(node)) throwWrongNode('embed', node);
}

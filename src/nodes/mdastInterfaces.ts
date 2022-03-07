import { Node } from 'unist';
import { WikiLink } from 'remark-wiki-link';
import { convert, is } from 'unist-util-is';
import { TextDirective } from 'mdast-util-directive';

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

export interface Label {
  name: string;
  type: string;
}

export interface LabeledNode extends Node {
  data: {
    label?: Label;
  };
}

export interface LabeledLink extends WikiLink {
  data: {
    label?: Label;
    alias?: string;
  };
}

export function assertNodeType<T extends Node>(
  node: Node,
  type: string,
): asserts node is T {
  if (!is<T>(node, type)) throwWrongNode(type, node);
}

function throwWrongNode(expected: string, node: Node): never {
  throw new Error(
    `Expected node of type ${expected} but received node ${JSON.stringify(
      node,
    )}`,
  );
}

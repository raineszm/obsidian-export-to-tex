import { Node } from 'unist';
import { is } from 'unist-util-is';
import { Parent } from 'mdast';

export function isParent(node: Node): node is Parent {
  return 'children' in node;
}

export function assertNodeType<T extends Node>(
  node: Node,
  type: string,
): asserts node is T {
  if (!is<T>(node, type)) throwWrongNode(type, node);
}

export function throwWrongNode(expected: string, node: Node): never {
  throw new Error(
    `Expected node of type ${expected} but received node ${JSON.stringify(
      node,
    )}`,
  );
}

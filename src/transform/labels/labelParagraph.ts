import { Paragraph, Text } from 'mdast';
import { Node } from 'unist';
import { is } from 'unist-util-is';

const LABEL_REGEX: RegExp = /^\^\w+$/;

export interface LabelParagraph extends Paragraph {
  children: Text[];
}

export function isLabelParagraph(node: Node): node is LabelParagraph {
  if (!is<Paragraph>(node, 'paragraph')) return false;
  if (node.children.length !== 1) return false;
  const child = node.children[0];
  if (!is<Text>(child, 'text')) return false;
  return child.value.match(LABEL_REGEX) !== null;
}

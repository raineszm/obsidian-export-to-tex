import { Paragraph, Text } from 'mdast';
import { Node } from 'unist';
import { is } from 'unist-util-is';

const LABEL_REGEX: RegExp = /^\^\w+$/;

export interface LabelText extends Text {}

export function isLabelText(node: Node): node is LabelText {
  return is<Text>(node, 'text') && node.value.match(LABEL_REGEX) !== null;
}

export interface LabelParagraph extends Paragraph {
  children: Text[];
}

export function isLabelParagraph(node: Node): node is LabelParagraph {
  return (
    is<Paragraph>(node, 'paragraph') &&
    node.children.length === 1 &&
    isLabelText(node.children[0])
  );
}

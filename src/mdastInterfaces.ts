import { Node } from 'unist';
import { Blockquote, Heading, Paragraph, Parent, Text } from 'mdast';
import { WikiLink } from 'remark-wiki-link';

export function isHeading(node: Node): node is Heading {
  return node.type === 'heading';
}

export function assertHeading(node: Node): asserts node is Heading {
  if (!isHeading(node)) throwWrongNode('heading', node);
}

export interface TextDirective extends Parent {
  type: 'textDirective';
  name: string;
  attributes?: unknown;
}

export function isTextDirective(node: Node): node is TextDirective {
  return node.type === 'textDirective';
}

export function assertTextDirective(node: Node): asserts node is TextDirective {
  if (!isTextDirective(node)) throwWrongNode('textDirective', node);
}

export interface LabelDirective extends TextDirective {
  name: 'label';
  attributes: {
    text: string;
  };
  data: {
    label?: string;
  };
}

export function isLabelDirective(node: Node): node is LabelDirective {
  return isTextDirective(node) && node.name === 'label';
}

export function assertLabelDirective(
  node: Node,
): asserts node is LabelDirective {
  if (!isLabelDirective(node)) throwWrongNode('label', node);
}

export interface EmbedDirective extends TextDirective {
  name: 'embed';
  attributes: {
    target: string;
  };
}

export function isEmbedDirective(node: Node): node is EmbedDirective {
  return isTextDirective(node) && node.name === 'embed';
}

export function assertEmbedDirective(
  node: Node,
): asserts node is EmbedDirective {
  if (!isEmbedDirective(node)) throwWrongNode('embed', node);
}

export interface LabeledLink extends WikiLink {
  data: {
    label?: Label;
    alias?: string;
    isHeading?: boolean;
  };
}

export function isLabeledLink(node: Node): node is LabeledLink {
  return node.type === 'wikiLink';
}

export function assertLabeledLink(node: Node): asserts node is LabeledLink {
  if (!isLabeledLink(node)) throwWrongNode('wikiLink', node);
}

export function isBlockquote(node: Node): node is Blockquote {
  return node.type === 'blockquote';
}

export function assertBlockquote(node: Node): asserts node is Blockquote {
  if (!isBlockquote(node)) throwWrongNode('blockquote', node);
}

export interface InlineMath extends Node {
  type: 'inlineMath';
  value: string;
}

export function isInlineMath(node: Node): node is InlineMath {
  return node.type === 'inlineMath';
}

export function assertInlineMath(node: Node): asserts node is InlineMath {
  if (!isInlineMath(node)) throwWrongNode('inlineMath', node);
}

export interface Math extends Node {
  type: 'math';
  value: string;
}

export function isMath(node: Node): node is Math {
  return node.type === 'math';
}

export function assertMath(node: Node): asserts node is Math {
  if (!isMath(node)) throwWrongNode('math', node);
}

export function isParagraph(node: Node): node is Paragraph {
  return node.type === 'paragraph';
}

export function isText(node: Node): node is Text {
  return node.type === 'text';
}

function throwWrongNode(expected: string, node: Node): never {
  throw new Error(
    `Expected node of type ${expected} but received node ${JSON.stringify(
      node,
    )}`,
  );
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

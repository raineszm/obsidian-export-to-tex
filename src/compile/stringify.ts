import { displayMath, inlineMath } from './math';
import { Node } from 'unist';
import { AugmentedContext, getContext, OptionalContext } from '../data';
import rebber from 'rebber';
import { assertNodeType } from '../nodeTypeHelpers';
import { Blockquote, Heading } from 'mdast';
import { Label } from '../transform/labels/label';
import { LabeledLink } from '../transform/labels/linkTarget';

const consume = (_ctx: unknown, _node: Node): string => '';
const yaml = consume;
export const rebberOverrides = {
  wikiLink: ensureContext(wikiLink),
  inlineMath: ensureContext(inlineMath),
  yaml,
  math: ensureContext(displayMath),
  heading: ensureContext(heading),
  blockquote: ensureContext(blockquote),
};

function ensureContext(
  fn: (ctx: AugmentedContext, node: Node) => string,
): (ctx: OptionalContext, node: Node) => string {
  return (ctx, node) => {
    return fn(getContext(ctx), node);
  };
}

const keyPrefixes: Record<string, string> = {
  heading: 'sec',
  block: 'block',
};

function getPrefix(targetType: string | undefined): string {
  if (targetType !== undefined && targetType in keyPrefixes) {
    return keyPrefixes[targetType] + ':';
  }
  return '';
}

function getRef(ctx: AugmentedContext, label: Label): string {
  const {
    exportToTex: { refCommand, generateLabels },
  } = ctx;
  if (!generateLabels) return '';
  return `\\${refCommand}{${getPrefix(label.type)}${label.name}}`;
}

function getLabel(ctx: AugmentedContext, label: Label): string {
  const {
    exportToTex: { generateLabels },
  } = ctx;
  if (!generateLabels) return '';
  return `\\label{${getPrefix(label.type)}${label.name}}`;
}

function wikiLink(ctx: AugmentedContext, node: Node): string {
  assertNodeType<LabeledLink>(node, 'wikiLink');

  const { alias, label } = node.data;
  if (!node.value.contains('#') || label === undefined) {
    return alias ?? node.value;
  }
  return `${alias ?? ''}${getRef(ctx, label)}`;
}

const headingNames = [
  'section',
  'subsection',
  'subsubsection',
  'paragraph',
  'subparagraph',
];

function heading(ctx: AugmentedContext, node: Node): string {
  assertNodeType<Heading>(node, 'heading');

  if (node.depth > 5) {
    return '';
  }
  const cmd = headingNames[node.depth - 1];
  const text = node.children
    .map((content) => rebber.toLaTeX(content, ctx))
    .join('');
  const label = node.data?.label as Label;
  return `\\${cmd}{${text}}${getLabel(ctx, label)}`;
}

function blockquote(ctx: AugmentedContext, node: Node): string {
  assertNodeType<Blockquote>(node, 'blockquote');
  const text = node.children
    .map((content) => rebber.toLaTeX(content, ctx))
    .join('');
  return `\\begin{quotation}\n${text}\\end{quotation}\n\n`;
}

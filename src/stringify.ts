import { displayMath, inlineMath } from './math';
import { Node } from 'unist';
import { AugmentedContext, getContext, OptionalContext } from './data';
import {
  assertBlockquote,
  assertHeading,
  assertLabelDirective,
  assertLabeledLink,
} from './mdastInterfaces';
import rebber from 'rebber';

const consume = (_ctx: unknown, _node: Node): string => '';
const yaml = consume;
export const rebberOverrides = {
  wikiLink: ensureContext(wikiLink),
  inlineMath: ensureContext(inlineMath),
  textDirective: ensureContext(textDirective),
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

function textDirective(ctx: AugmentedContext, node: Node): string {
  assertLabelDirective(node);
  return getLabel(ctx, 'block', node.data?.label ?? '');
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

function getRef(
  ctx: AugmentedContext,
  targetType: string | undefined,
  label: string,
): string {
  const {
    exportToTex: { refCommand, generateLabels },
  } = ctx;
  if (!generateLabels) return '';
  return `\\${refCommand}{${getPrefix(targetType)}${label}}`;
}

function getLabel(
  ctx: AugmentedContext,
  targetType: string | undefined,
  label: string,
): string {
  const {
    exportToTex: { generateLabels },
  } = ctx;
  if (!generateLabels) return '';
  return `\\label{${getPrefix(targetType)}${label}}`;
}

function wikiLink(ctx: AugmentedContext, node: Node): string {
  assertLabeledLink(node);

  const { alias, label, targetType } = node.data;
  if (!node.value.contains('#') || label === undefined) {
    return alias ?? node.value;
  }
  return `${alias ?? ''}${getRef(ctx, targetType, label)}`;
}

const headingNames = [
  'section',
  'subsection',
  'subsubsection',
  'paragraph',
  'subparagraph',
];

function heading(ctx: AugmentedContext, node: Node): string {
  assertHeading(node);

  if (node.depth > 5) {
    return '';
  }
  const cmd = headingNames[node.depth - 1];
  const text = node.children
    .map((content) => rebber.toLaTeX(content, ctx))
    .join('');
  const label = node.data?.label as string;
  return `\\${cmd}{${text}}${getLabel(ctx, 'heading', label)}`;
}

function blockquote(ctx: AugmentedContext, node: Node): string {
  assertBlockquote(node);
  const text = node.children
    .map((content) => rebber.toLaTeX(content, ctx))
    .join('');
  return `\\begin{quotation}\n${text}\\end{quotation}\n\n`;
}

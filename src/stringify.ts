import { displayMath, inlineMath } from './math';
import { Node } from 'unist';
import { AugmentedContext, getContext, OptionalContext } from './data';
import {
  assertHeading,
  assertLabelDirective,
  assertLabeledLink,
  LabelDirective,
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
};

function ensureContext(
  fn: (ctx: AugmentedContext, node: Node) => string,
): (ctx: OptionalContext, node: Node) => string {
  return (ctx, node) => {
    return fn(getContext(ctx), node);
  };
}

function textDirective(_ctx: AugmentedContext, node: Node): string {
  assertLabelDirective(node);
  return stringifyLabel(node);
}

function stringifyLabel(directive: LabelDirective): string {
  return `\\label{${getPrefix('heading')}${directive.data?.label ?? ''}}`;
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

function wikiLink(ctx: AugmentedContext, node: Node): string {
  assertLabeledLink(node);
  const {
    exportToTex: { refCommand },
  } = ctx;

  const { alias, label, targetType } = node.data;
  if (!node.value.contains('#') || label === undefined) {
    return alias ?? node.value;
  }
  return `${alias ?? ''}\\${refCommand}{${getPrefix(targetType)}${label}}`;
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
  return `\\${cmd}{${text}}\\label{${getPrefix('heading')}${label}}`;
}

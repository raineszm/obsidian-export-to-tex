import unified from 'unified';
import markdown from 'remark-parse';
import math from 'remark-math';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import { wikiLinkPlugin } from 'remark-wiki-link';
import frontmatter from 'remark-frontmatter';
import rebber from 'rebber';
import { Node } from 'unist';
import { embed } from './embed';
import { displayMath, inlineMath } from './math';
import { labels } from './labels';
import { AugmentedContext, getContext, OptionalContext } from './data';
import {
  assertHeading,
  assertLabelDirective,
  assertLabeledLink,
  LabelDirective,
} from './mdastInterfaces';

const consume = (_ctx: unknown, _node: Node): string => '';
const yaml = consume;

const rebberOverrides = {
  wikiLink: ensureContext(wikiLink),
  inlineMath: ensureContext(inlineMath),
  textDirective: ensureContext(textDirective),
  yaml,
  math: ensureContext(displayMath),
  heading: ensureContext(heading),
};
export const markdownToTex = unified()
  .use(markdown)
  .use(gfm)
  .use(math)
  .use(frontmatter)
  .use(directive)
  .use(wikiLinkPlugin, {
    aliasDivider: '|',
  })
  .use(embed)
  .use(labels)
  .use(rebber, {
    overrides: rebberOverrides,
  })
  .freeze();

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
  return `\\label{${directive.data?.label ?? ''}}`;
}

function wikiLink(ctx: AugmentedContext, node: Node): string {
  assertLabeledLink(node);
  const {
    exportToTex: { refCommand },
  } = ctx;

  const { alias, label } = node.data;
  if (!node.value.contains('#') || label === undefined) {
    return alias ?? node.value;
  }
  return `${alias ?? ''}\\${refCommand}{${label}}`;
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
  return `\\${cmd}{${text}}\\label{${label}}`;
}

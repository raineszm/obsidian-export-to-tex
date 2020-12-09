import unified from 'unified';
import markdown from 'remark-parse';
import math from 'remark-math';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import { WikiLink, wikiLinkPlugin } from 'remark-wiki-link';
import frontmatter from 'remark-frontmatter';
import slug from 'remark-slug';
import rebber, { RebberSettings } from 'rebber';
import { Node } from 'unist';
import { Heading } from 'mdast';
import { LabelDirective, TextDirective } from './directives';
import { embed } from './embed';
// import { ExportToTexSettings } from './settings';

const consume = (_ctx: unknown, _node: Node): string => '';
const yaml = consume;

// type AugmentedContext = RebberSettings & {
//   exportToTex: ExportToTexSettings;
// };

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
  .use(slug)
  .use(rebber, {
    overrides: {
      wikiLink,
      inlineMath,
      textDirective,
      yaml,
      math: displayMath,
      heading,
    },
  })
  .freeze();

interface InlineMath extends Node {
  type: 'inlineMath';
  value: string;
}

interface Math extends Node {
  type: 'math';
  value: string;
}

function inlineMath(_ctx: RebberSettings, node: Node): string {
  const mathNode = node as InlineMath;
  return `$${mathNode.value}$`;
}

function displayMath(_ctx: RebberSettings, node: Node): string {
  const mathNode = node as Math;
  return `\\[\n${mathNode.value}\n\\]`;
}

function textDirective(_ctx: RebberSettings, node: Node): string {
  const directive = node as TextDirective;
  if (directive.name === 'label') {
    return stringifyLabel(directive as LabelDirective);
  }
  throw new Error(`Unsupported directive type: ${directive.name}`);
}

function stringifyLabel(directive: LabelDirective): string {
  return `\\label{${directive.attributes.text}}`;
}

function wikiLink(_ctx: RebberSettings, node: Node): string {
  // const { refCommand } = ctx as ExportToTexSettings;
  const link = node as WikiLink;
  const { alias } = link.data;
  return alias ?? link.value;
}

const headingNames = [
  'section',
  'subsection',
  'subsubsection',
  'paragraph',
  'subparagraph',
];

function heading(ctx: RebberSettings, node: Node): string {
  const heading = node as Heading;
  if (heading.depth > 5) {
    return '';
  }
  const cmd = headingNames[heading.depth];
  const text = heading.children
    .map((content) => rebber.toLatex(content, ctx))
    .join('');
  const label = heading.data?.id as string;
  return `\\${cmd}{${text}}\\label{sec:${label}}`;
}

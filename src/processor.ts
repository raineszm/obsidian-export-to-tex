import unified from 'unified';
import markdown from 'remark-parse';
import math from 'remark-math';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import { WikiLink, wikiLinkPlugin } from 'remark-wiki-link';
import frontmatter from 'remark-frontmatter';
import rebber, { RebberSettings } from 'rebber';
import { Node } from 'unist';
import { LabelDirective, TextDirective } from './directives';
import { embed } from './embed';
// import { ExportToTexSettings } from './settings';

const consume = (_ctx: unknown, _node: Node): string => '';
const yaml = consume;

// type AugmentedContext = RebberSettings & {
//   exportToTex: ExportToTexSettings;
// };

const headings = [
  'section',
  'subsection',
  'subsubsection',
  'paragraph',
  'subparagraph',
].map((cmd) => {
  return (text: string) => `\\${cmd}{${text}}`;
});

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
  .use(rebber, {
    overrides: {
      wikiLink,
      inlineMath,
      textDirective,
      yaml,
      math: displayMath,
    },
    headings,
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

function textDirective(ctx: RebberSettings, node: Node): string {
  const directive = node as TextDirective;
  if (directive.name === 'label') {
    return stringifyLabel(directive as LabelDirective);
  }
  throw new Error(`Unsupported directive type: ${directive.name}`);
}

function stringifyLabel(directive: LabelDirective): string {
  return `\\label{${directive.attributes.text}}`;
}

function wikiLink(ctx: RebberSettings, node: Node): string {
  // const { refCommand } = ctx as ExportToTexSettings;
  const link = node as WikiLink;
  const { alias } = link.data;
  return alias ?? link.value;
}

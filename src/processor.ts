import unified from 'unified';
import markdown from 'remark-parse';
import math from 'remark-math';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import { wikiLinkPlugin } from 'remark-wiki-link';
import frontmatter from 'remark-frontmatter';
import rebber from 'rebber';
import { Node } from 'unist';
import { LabelDirective, TextDirective } from './directives';
import { embed } from './embed';

const consume = (_ctx: unknown, _node: Node): string => '';
const wikiLink = consume;
const yaml = consume;

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
  });

interface InlineMath extends Node {
  type: 'inlineMath';
  value: string;
}

interface Math extends Node {
  type: 'math';
  value: string;
}

function inlineMath(_ctx: unknown, node: Node): string {
  const mathNode = node as InlineMath;
  return `$${mathNode.value}$`;
}

function displayMath(_ctx: unknown, node: Node): string {
  const mathNode = node as Math;
  return `\\[\n${mathNode.value}\n\\]`;
}

function textDirective(_ctx: unknown, node: Node): string {
  const directive = node as TextDirective;
  if (directive.name === 'label') {
    return stringifyLabel(directive as LabelDirective);
  }
  throw new Error(`Unsupported directive type: ${directive.name}`);
}

function stringifyLabel(directive: LabelDirective): string {
  return `\\label{${directive.attributes.text}}`;
}

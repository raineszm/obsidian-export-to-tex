import unified from 'unified';
import markdown from 'remark-parse';
import math from 'remark-math';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import { wikiLinkPlugin } from 'remark-wiki-link';
import frontmatter from 'remark-frontmatter';
import rebber from 'rebber';
import { Node } from 'unist';

export const markdownToTex = unified()
  .use(markdown)
  .use(gfm)
  .use(math)
  .use(frontmatter)
  .use(directive)
  .use(wikiLinkPlugin, {
    aliasDivider: '|',
  })
  .use(rebber, {
    overrides: {
      wikiLink: stringifyWikilink,
      inlineMath: stringifyWikilink,
      math: stringifyWikilink,
      textDirective: stringifyWikilink,
    },
  });

function stringifyWikilink(ctx: unknown, node: Node): string {
  return '';
}

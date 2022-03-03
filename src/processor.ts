import unified from 'unified';
import markdown from 'remark-parse';
import math from 'remark-math';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import wikiLinkPlugin from 'remark-wiki-link';
import frontmatter from 'remark-frontmatter';
import rebber from 'rebber';
import { embed } from './embed';
import { labels } from './labels';
import { rebberOverrides } from './stringify';

export const markdownToAst = unified()
  .use(markdown)
  .use(gfm)
  .use(math)
  .use(frontmatter)
  .use(directive)
  .use(wikiLinkPlugin, {
    aliasDivider: '|',
  });

export const markdownToTex = markdownToAst
  .use(embed)
  .use(labels)
  .use(rebber, {
    overrides: rebberOverrides,
  })
  .freeze();

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import math from 'remark-math';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import wikiLinkPlugin from 'remark-wiki-link';
import frontmatter from 'remark-frontmatter';
import rebber from 'rebber';
import { embed } from './transform/embed';
import { labels } from './transform/labels';
import { rebberOverrides } from './compile/stringify';

export const markdownToTex = unified()
  .use(remarkParse)
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

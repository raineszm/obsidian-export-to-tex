import { unified } from 'unified';
import remarkParse from 'remark-parse';
import math from 'remark-math';
import gfm from 'remark-gfm';
import directive from 'remark-directive';
import wikiLinkPlugin from 'remark-wiki-link';
import frontmatter from 'remark-frontmatter';
import { embed } from './transform/embeds';
import { labels } from './transform/labels';
import { texCompiler } from './compile/texCompiler';

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
  .use(texCompiler)
  .freeze();

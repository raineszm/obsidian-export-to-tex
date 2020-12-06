declare module 'remark-wiki-link' {
  import { Plugin } from 'unified';
  interface WikiLinkOptions {
    permalinks?: string;
    pageResolver?: (pageName: string) => [string];
    hrefTemplate?: (permalink: string) => [string];
    wikiLinkClassName?: string;
    newClassName?: string;
    aliasDivider?: string;
  }
  export const wikiLinkPlugin: Plugin<[WikiLinkOptions?]>;
}

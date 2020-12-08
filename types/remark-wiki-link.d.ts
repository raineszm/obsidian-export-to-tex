declare module 'remark-wiki-link' {
  import { Plugin } from 'unified';
  import { Node } from 'unist';
  export interface WikiLinkOptions {
    permalinks?: string;
    pageResolver?: (pageName: string) => [string];
    hrefTemplate?: (permalink: string) => [string];
    wikiLinkClassName?: string;
    newClassName?: string;
    aliasDivider?: string;
  }
  export interface WikiLink extends Node {
    type: 'wikiLink';
    value: string;
    data: {
      alias?: string;
    };
  }
  export const wikiLinkPlugin: Plugin<[WikiLinkOptions?]>;
}

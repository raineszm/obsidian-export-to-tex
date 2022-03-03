declare module 'remark-wiki-link' {
  import { Plugin } from 'unified';
  import { Node } from 'unist';
  namespace wikiLinkPlugin {
    interface WikiLink extends Node {
      type: 'wikiLink';
      value: string;
      data: {
        alias?: string;
      };
    }
    interface WikiLinkOptions {
      permalinks?: string;
      pageResolver?: (pageName: string) => [string];
      hrefTemplate?: (permalink: string) => [string];
      wikiLinkClassName?: string;
      newClassName?: string;
      aliasDivider?: string;
    }
  }
  const wikiLinkPlugin: Plugin<[wikiLinkPlugin.WikiLinkOptions?]>;
  export = wikiLinkPlugin;
}

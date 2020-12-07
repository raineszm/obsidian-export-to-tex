declare module 'rebber' {
  import { Node } from 'unist';
  import { Plugin, Processor } from 'unified';
  type NodeStringifier = (ctx: RebberSettings, node: Node) => string;
  interface RebberSettings {
    overrides?: {
      [key: string]: NodeStringifier;
    };
    headings?: Array<(text: string) => string>;
  }
  type Rebber = Plugin<[RebberSettings?]> & {
    toLatex: Processor;
  };

  const stringify: Rebber;
  export = stringify;
}

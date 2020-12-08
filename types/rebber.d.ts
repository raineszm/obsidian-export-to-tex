declare module 'rebber' {
  import { Node } from 'unist';
  import { Plugin, Processor } from 'unified';

  namespace Rebber {
    type NodeStringifier = (ctx: RebberSettings, node: Node) => string;
    interface RebberSettings {
      overrides?: {
        [key: string]: NodeStringifier;
      };
      headings?: Array<(text: string) => string>;
    }
    type stringify = Plugin<[RebberSettings?]> & {
      toLatex: Processor;
    };
  }

  const Rebber: Rebber.stringify;
  export = Rebber;
}

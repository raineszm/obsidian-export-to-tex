declare module 'rebber' {
  import { Node } from 'unist';
  import { Plugin, Processor } from 'unified';
  interface NodeStringifier {
    (ctx: unknown, node: Node): string;
  }
  interface RebberSettings {
    overrides?: {
      [key: string]: NodeStringifier;
    };
  }
  type Rebber = Plugin<[RebberSettings?]> & {
    toLatex: Processor;
  };

  const stringify: Rebber;
  export = stringify;
}

declare module 'rebber' {
  import { Plugin, Processor } from 'unified';
  interface RebberSettings {
    overrides?: unknown;
  }
  type Rebber = Plugin<[RebberSettings?]> & {
    toLatex: Processor;
  };

  const stringify: Rebber;
  export = stringify;
}

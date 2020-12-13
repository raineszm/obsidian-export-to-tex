import { Node } from 'unist';
import { RebberSettings } from 'rebber';
import { log, prefix } from './log';
import { AugmentedContext } from './data';
import { assertInlineMath, assertMath } from './mdastInterfaces';

const mathEnvironments = [
  'equation',
  'multline',
  'gather',
  'align',
  'flalign',
  'split',
  'alignat',
];
const beginRegex = /^\s*\\begin{\s*(\w+)\*?\s*}/m;

export function inlineMath(_ctx: RebberSettings, node: Node): string {
  assertInlineMath(node);
  return `$${node.value}$`;
}

export function displayMath(ctx: RebberSettings, node: Node): string {
  assertMath(node);
  const { value } = node;
  const match = beginRegex.exec(value);
  const {
    exportToTex: { additionalMathEnvironments },
  } = ctx as AugmentedContext;
  if (
    match !== null &&
    (mathEnvironments.contains(match[1]) ||
      additionalMathEnvironments.contains(match[1]))
  ) {
    log.debug(
      prefix,
      `stripping delimiters from top level math env ${match[1]}`,
    );
    return value;
  }
  return `\\[\n${value}\n\\]`;
}

import { Node } from 'unist';
import { RebberSettings } from 'rebber';
import { log, prefix } from './log';
import { ExportToTexSettings } from './settings';

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

interface InlineMath extends Node {
  type: 'inlineMath';
  value: string;
}

interface Math extends Node {
  type: 'math';
  value: string;
}

export function inlineMath(_ctx: RebberSettings, node: Node): string {
  const mathNode = node as InlineMath;
  return `$${mathNode.value}$`;
}

type AugmentedContext = RebberSettings & {
  exportToTex: ExportToTexSettings;
};

export function displayMath(ctx: RebberSettings, node: Node): string {
  const { value } = node as Math;
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

import { Node } from 'unist';
import { RebberSettings } from 'rebber';
import { log, prefix } from './log';

const mathEnvironments = ['equation', 'multline', 'gather', 'align'];
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

export function displayMath(_ctx: RebberSettings, node: Node): string {
  const { value } = node as Math;
  const match = beginRegex.exec(value);
  if (match !== null && mathEnvironments.contains(match[1])) {
    log.debug(
      prefix,
      `stripping delimiters from top level math env ${match[1]}`,
    );
    return value;
  }
  return `\\[\n${value}\n\\]`;
}

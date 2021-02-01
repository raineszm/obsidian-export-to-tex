import { Node } from 'unist';
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

export function inlineMath(_ctx: AugmentedContext, node: Node): string {
  assertInlineMath(node);
  return `$${node.value}$`;
}

export function displayMath(ctx: AugmentedContext, node: Node): string {
  assertMath(node);
  const { value } = node;
  const match = beginRegex.exec(value);
  const {
    exportToTex: { additionalMathEnvironments, defaultToEquation },
  } = ctx;
  if (
    match !== null &&
    (mathEnvironments.contains(match[1]) ||
      additionalMathEnvironments.contains(match[1]))
  ) {
    return value;
  }

  if (defaultToEquation) {
    return `\\begin{equation}\n${value}\n\\end{equation}`;
  }

  return `\\[\n${value}\n\\]`;
}

import { Node } from 'unist';
import { AugmentedContext } from '../data';
import { assertNodeType } from '../nodeTypeHelpers';
import { InlineMath, Math } from 'mdast-util-math';
import { getLabel } from './getRef';
import { LabeledNode } from '../transform/labels/label';

const mathEnvironments = [
  'equation',
  'multline',
  'gather',
  'align',
  'flalign',
  'split',
  'alignat',
];
const endRegex = /^\s*\\end{\s*(\w+)\*?\s*}/m;

export function inlineMath(_ctx: AugmentedContext, node: Node): string {
  assertNodeType<InlineMath>(node, 'inlineMath');
  return `$${node.value}$`;
}

export function displayMath(ctx: AugmentedContext, node: Node): string {
  assertNodeType<Math>(node, 'math');
  const { value } = node;
  const match = endRegex.exec(value);
  const {
    exportToTex: { additionalMathEnvironments, defaultToEquation },
  } = ctx;

  const label = (node as LabeledNode).data.label;

  if (
    match !== null &&
    (mathEnvironments.contains(match[1]) ||
      additionalMathEnvironments.contains(match[1]))
  ) {
    if (label !== undefined) {
      return `${value.slice(0, match.index)}${getLabel(ctx, label)}
      ${value.slice(match.index)}`;
    }
    return value;
  }

  if (defaultToEquation || label !== undefined) {
    const labelText = label === undefined ? '' : getLabel(ctx, label);
    return `\\begin{equation}
    ${value}${labelText}
    \\end{equation}`;
  }

  return `\\[
  ${value}
  \\]`;
}

import { Math } from 'mdast-util-math';
import { getLabel } from '../getRef';
import { LabeledNode } from '../../transform/labels/label';
import { ExportToTexSettings } from '../../plugin/settings';

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

export function displayMath(settings: ExportToTexSettings, math: Math): string {
  const { value } = math;
  const match = endRegex.exec(value);
  const { additionalMathEnvironments, defaultToEquation } = settings;

  const label = (math as LabeledNode).data.label;

  if (
    match !== null &&
    (mathEnvironments.contains(match[1]) ||
      additionalMathEnvironments.contains(match[1]))
  ) {
    if (label !== undefined) {
      return `${value.slice(0, match.index)}${getLabel(
        settings,
        label,
      )}\n${value.slice(match.index)}`;
    }
    return value;
  }

  if (defaultToEquation || label !== undefined) {
    const labelText = label === undefined ? '' : getLabel(settings, label);
    return `\\begin{equation}\n${value}${labelText}\n\\end{equation}`;
  }

  return `\\[\n${value}\n\\]`;
}

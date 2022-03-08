import { AugmentedContext } from '../data';
import { Label } from '../transform/labels/label';

const keyPrefixes: Record<string, string> = {
  heading: 'sec',
  math: 'eq',
  image: 'fig',
};

function getPrefix(targetType: string | undefined): string {
  if (targetType !== undefined && targetType in keyPrefixes) {
    return keyPrefixes[targetType] + ':';
  }
  return '';
}

export function getRef(ctx: AugmentedContext, label: Label): string {
  const {
    exportToTex: { refCommand, generateLabels },
  } = ctx;
  if (!generateLabels) return '';
  return `\\${refCommand}{${getPrefix(label.type)}${label.name}}`;
}

export function getLabel(ctx: AugmentedContext, label: Label): string {
  const {
    exportToTex: { generateLabels },
  } = ctx;
  if (!generateLabels) return '';
  return `\\label{${getPrefix(label.type)}${label.name}}`;
}

import { Label } from '../transform/labels/label';
import { ExportToTexSettings } from '../plugin/settings';

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

export function getRef(settings: ExportToTexSettings, label: Label): string {
  const { refCommand, generateLabels } = settings;
  if (!generateLabels) return '';
  return `\\${refCommand}{${getPrefix(label.type)}${label.name}}`;
}

export function getLabel(settings: ExportToTexSettings, label: Label): string {
  const { generateLabels } = settings;
  if (!generateLabels) return '';
  return `\\label{${getPrefix(label.type)}${label.name}}`;
}

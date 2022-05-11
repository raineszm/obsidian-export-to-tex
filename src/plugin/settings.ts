import { merge } from 'merge-anything';
export enum ImagePathSettings {
  RelativeToRoot,
  FullPath,
  BaseName,
  RelativeToExport,
}

export const ImagePathSettingDescriptions = [
  'Relative to vault root',
  'Absolute path',
  'File base name',
  'Relative to export directory',
];

export class ExportToTexSettings {
  refCommand: string = 'cref';
  defaultToEquation: boolean = false;
  additionalMathEnvironments: string[] = [];
  generateLabels: boolean = true;
  compressNewlines: boolean = false;
  imagePathSettings: ImagePathSettings = ImagePathSettings.RelativeToRoot;
  numberedSections: boolean = true;
}

export type PartialSettings = Partial<ExportToTexSettings> & {
  // Deprecated options
  fullImagePath?: boolean;
  defaultExportDirectory: string;
};

export function ensureSettings(partial: PartialSettings): ExportToTexSettings {
  const settings = merge(
    new ExportToTexSettings(),
    partial as Partial<ExportToTexSettings>,
  );

  // Convert deprecated settings
  if (
    settings.imagePathSettings === undefined &&
    partial.fullImagePath !== undefined
  ) {
    settings.imagePathSettings = partial.fullImagePath
      ? ImagePathSettings.FullPath
      : ImagePathSettings.RelativeToRoot;
  }

  return settings;
}

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
}

export type PartialSettings = Partial<ExportToTexSettings> & {
  // Deprecated options
  fullImagePath?: boolean;
  defaultExportDirectory: string;
};

export function ensureSettings(partial: PartialSettings): ExportToTexSettings {
  const settings = new ExportToTexSettings();

  settings.refCommand = partial.refCommand ?? settings.refCommand;

  settings.additionalMathEnvironments =
    partial.additionalMathEnvironments ?? settings.additionalMathEnvironments;

  settings.generateLabels = partial.generateLabels ?? settings.generateLabels;

  settings.defaultToEquation =
    partial.defaultToEquation ?? settings.defaultToEquation;

  settings.compressNewlines =
    partial.compressNewlines ?? settings.compressNewlines;

  if (
    partial.imagePathSettings === undefined &&
    partial.fullImagePath !== undefined
  ) {
    settings.imagePathSettings = partial.fullImagePath
      ? ImagePathSettings.FullPath
      : ImagePathSettings.RelativeToRoot;
  } else {
    settings.imagePathSettings =
      partial.imagePathSettings ?? settings.imagePathSettings;
  }

  return settings;
}

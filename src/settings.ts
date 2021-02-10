export class ExportToTexSettings {
  refCommand: string = 'cref';
  defaultToEquation: boolean = false;
  additionalMathEnvironments: string[] = [];
  generateLabels: boolean = true;
  compressNewlines: boolean = false;
  fullImagePath: boolean = false;
}

export type PartialSettings = Partial<ExportToTexSettings>;

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

  settings.fullImagePath = partial.fullImagePath ?? settings.fullImagePath;

  return settings;
}

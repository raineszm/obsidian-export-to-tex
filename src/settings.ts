export class ExportToTexSettings {
  refCommand: string = 'cref';
  additionalMathEnvironments: string[] = [];
  generateLabels: boolean = true;
}

export type PartialSettings = Partial<ExportToTexSettings>;

export function ensureSettings(partial: PartialSettings): ExportToTexSettings {
  const settings = new ExportToTexSettings();

  settings.refCommand = partial.refCommand ?? settings.refCommand;

  settings.additionalMathEnvironments =
    partial.additionalMathEnvironments ?? settings.additionalMathEnvironments;

  settings.generateLabels = partial.generateLabels ?? settings.generateLabels;

  return settings;
}

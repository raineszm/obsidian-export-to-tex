export class ExportToTexSettings {
  refCommand: string = 'cref';
  additionalMathEnvironments: string[] = [];
}

export type PartialSettings = Partial<ExportToTexSettings>;

export function ensureSettings(partial: PartialSettings): ExportToTexSettings {
  const settings = new ExportToTexSettings();

  settings.refCommand = partial.refCommand ?? settings.refCommand;

  settings.additionalMathEnvironments =
    partial.additionalMathEnvironments ?? settings.additionalMathEnvironments;

  return settings;
}

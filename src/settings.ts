import { LogLevelString } from './log';

export class ExportToTexSettings {
  refCommand: string = 'cref';
  logLevel: LogLevelString = 'warn';
  additionalMathEnvironments: string[] = [];
}

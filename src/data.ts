import { RebberSettings } from 'rebber';
import { ExportToTexSettings } from './settings';

export interface TexContext {
  exportToTex: ExportToTexSettings;
}

export type AugmentedContext = RebberSettings & TexContext;

import { RebberSettings } from 'rebber';
import { ExportToTexSettings } from './settings';

interface TexContext {
  exportToTex: ExportToTexSettings;
}

export type AugmentedContext = RebberSettings & TexContext;
export type OptionalContext = RebberSettings & Partial<TexContext>;

export function getContext(ctx: OptionalContext): AugmentedContext {
  if (ctx.exportToTex === undefined) {
    throw new Error('Settings missing for export to tex');
  }
  return ctx as AugmentedContext;
}

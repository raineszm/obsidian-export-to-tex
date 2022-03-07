import { RebberSettings } from 'rebber';
import { ExportToTexSettings } from './plugin/settings';

export interface TexContext {
  exportToTex: ExportToTexSettings;
}

export function isTexContext(ctx: any): ctx is TexContext {
  return 'exportToTex' in ctx && ctx.exportToTex instanceof ExportToTexSettings;
}

export type AugmentedContext = RebberSettings & TexContext;
export type OptionalContext = RebberSettings & Partial<TexContext>;

export function getContext(ctx: OptionalContext): AugmentedContext {
  if (!isTexContext(ctx)) {
    throw new Error('Settings missing for export to tex');
  }
  return ctx;
}

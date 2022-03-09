import { ExportToTexSettings } from './plugin/settings';

export interface TexContext {
  exportToTex: ExportToTexSettings;
}

export function isTexContext(ctx: any): ctx is TexContext {
  return 'exportToTex' in ctx && ctx.exportToTex instanceof ExportToTexSettings;
}

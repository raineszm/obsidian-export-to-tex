import { MetadataCache, TFile } from 'obsidian';
import { markdownToTex } from './processor';
import { toVFile } from './file';
import { VFile } from 'vfile';
import { ExportToTexSettings } from './settings';
import vfileReporterPretty from 'vfile-reporter-pretty';

export class TeXPrinter {
  constructor(
    readonly metadata: MetadataCache,
    readonly settings: ExportToTexSettings,
  ) {}

  async process(vfile: VFile): Promise<string> {
    const output = await markdownToTex()
      .data('settings', {
        exportToTex: this.settings,
      })
      .data('metadata', this.metadata)
      .process(vfile);
    return output.toString();
  }

  async toTex(file: TFile): Promise<string> {
    const vfile = await toVFile(file);
    console.groupCollapsed('export-to-tex');
    const tex = await this.process(vfile);
    console.log(vfileReporterPretty([vfile]));
    console.groupEnd();
    return tex;
  }
}

import { MetadataCache, TFile } from 'obsidian';
import { markdownToTex } from './processor';
import { toVFile } from './file';
import { VFile } from 'vfile';
import { ExportToTexSettings } from './settings';

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
      .process(vfile);
    return output.toString();
  }

  async print(file: TFile): Promise<string> {
    const vfile = await toVFile(file, this.metadata);
    return await this.process(vfile);
  }
}

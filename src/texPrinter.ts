import { MetadataCache, TFile } from 'obsidian';
import { markdownToTex } from './processor.js';
import { toVFile } from './file';
import { VFile } from 'vfile';
import { ExportToTexSettings } from './plugin/settings';
import reporter from 'vfile-reporter';

export class TeXPrinter {
  constructor(
    readonly metadata: MetadataCache,
    readonly settings: ExportToTexSettings,
    readonly exportPath?: string,
  ) {}

  async process(vfile: VFile): Promise<string> {
    const output = await markdownToTex()
      .data('settings', {
        exportToTex: this.settings,
      })
      .data('metadata', this.metadata)
      .data('exportPath', this.exportPath)
      .process(vfile);
    return output.toString();
  }

  async toTex(file: TFile): Promise<string> {
    const vfile = await toVFile(file);
    console.groupCollapsed('export-to-tex');
    let tex = await this.process(vfile);
    console.log(reporter(vfile));
    if (this.settings.compressNewlines) {
      console.log('Compressing newlines');
      tex = TeXPrinter.compressNewlines(tex);
    }
    console.groupEnd();
    return tex;
  }

  private static compressNewlines(tex: string): string {
    const lines = tex.split('\n');
    const output = [];
    let wasEmpty = false;
    for (const line of lines) {
      if (line === '') {
        wasEmpty = true;
        continue;
      }

      if (wasEmpty) {
        output.push('');
        wasEmpty = false;
      }
      output.push(line);
    }

    return output.join('\n');
  }
}

import { MetadataCache, TFile } from 'obsidian';
import { markdownToTex } from './processor';
import { toVFile } from './file';
import { VFile } from 'vfile';

export class TeXPrinter {
  constructor(readonly metadata: MetadataCache) {}

  async process(vfile: VFile): Promise<string> {
    const output = await markdownToTex.process(vfile);
    return output.toString();
  }

  async print(file: TFile): Promise<string> {
    const vfile = await toVFile(file, this.metadata);
    return await this.process(vfile);
  }
}

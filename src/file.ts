import vfile, { VFile, VFileOptions } from 'vfile';
import { MetadataCache, TFile } from 'obsidian';
import { preprocess } from './preprocessor';

export interface ObsidianVFile extends VFile {
  data: {
    file: TFile;
    metadata: MetadataCache;
  };
}

export async function toVFile(
  file: TFile,
  metadata: MetadataCache,
): Promise<VFile> {
  const data = await file.vault.cachedRead(file);
  const options: VFileOptions = {
    contents: preprocess(data),
    data: {
      file,
      metadata,
    },
  };
  return vfile(options);
}

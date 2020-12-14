import vfile, { VFile, VFileOptions } from 'vfile';
import { TFile } from 'obsidian';
import { preprocess } from './preprocessor';

export async function toVFile(file: TFile): Promise<VFile> {
  const data = await file.vault.cachedRead(file);
  const options: VFileOptions = {
    contents: preprocess(data),
    path: file.path,
  };
  return vfile(options);
}

type NameKeys = 'path' | 'basename' | 'ext' | 'stem';
type NamedVFile = {
  [P in keyof VFile]-?: P extends NameKeys ? NonNullable<VFile[P]> : VFile[P];
};

export function toNamedVFile(vfile: VFile): NamedVFile {
  if (vfile.path === undefined)
    throw new Error('Processed file must have a name');
  return vfile as NamedVFile;
}

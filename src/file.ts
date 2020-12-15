import vfile, { VFile, VFileOptions } from 'vfile';
import { TFile } from 'obsidian';
import { preprocess } from './preprocessor';

export interface ObsidianVFile extends VFile {
  subpath?: string;
}

export async function toVFile(file: TFile): Promise<ObsidianVFile> {
  const data = await file.vault.cachedRead(file);
  return makeVFile(data, file.path);
}

export function makeVFile(
  contents: string,
  path: string,
  subpath?: string,
): ObsidianVFile {
  const options: VFileOptions = {
    contents: preprocess(contents),
    path,
    data: { embedded: new Array<VFile>() },
    subpath,
  };
  return vfile(options);
}

type NameKeys = 'path' | 'basename' | 'ext' | 'stem';
type NamedVFile = {
  [P in keyof ObsidianVFile]-?: P extends NameKeys
    ? NonNullable<ObsidianVFile[P]>
    : ObsidianVFile[P];
};

export function toNamedVFile(vfile: ObsidianVFile): NamedVFile {
  if (vfile.path === undefined)
    throw new Error('Processed file must have a name');
  return vfile as NamedVFile;
}

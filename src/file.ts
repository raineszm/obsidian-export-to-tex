import vfile, { VFile, VFileOptions } from 'vfile';
import { TFile } from 'obsidian';
import { preprocess } from './preprocessor';

export interface ObsidianVFile extends VFile {
  subpath?: string;
}

export interface VFileData {
  embedded: ObsidianVFile[];
}

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  // eslint-disable-next-line no-prototype-builtins
  return obj.hasOwnProperty(prop);
}

export function isVFileData(data: unknown): data is VFileData {
  return (
    typeof data === 'object' &&
    data !== null &&
    hasOwnProperty(data, 'embedded') &&
    Array.isArray(data.embedded)
  );
}

export function assertVFileData(data: unknown): asserts data is VFileData {
  if (!isVFileData(data)) {
    throw new Error(
      'expected vfile data to be in a particular format but it was not',
    );
  }
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

import vfile, { VFile, VFileOptions } from 'vfile';
import { TFile } from 'obsidian';
import { preprocess } from './preprocessor';

export interface VFileData {
  embedded: VFile[];
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

export async function toVFile(file: TFile): Promise<VFile> {
  const data = await file.vault.cachedRead(file);
  const options: VFileOptions = {
    contents: preprocess(data),
    path: file.path,
    data: { embedded: new Array<VFile>() },
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

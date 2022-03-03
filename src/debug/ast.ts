import { MetadataCache, TFile } from 'obsidian';
import { markdownToTex } from '../processor';
import { toVFile } from '../file';
import { ExportToTexSettings } from '../settings';

export async function exportAstToConsole(file: TFile): Promise<void> {
  const ast = await markdownToTex().parse(await toVFile(file));
  console.log(ast);
}

export async function exportModifiedAstToConsole(
  file: TFile,
  settings: ExportToTexSettings,
  metadata: MetadataCache,
): Promise<void> {
  const processor = await markdownToTex()
    .data('settings', {
      exportToTex: settings,
    })
    .data('metadata', metadata)
    .freeze();
  const vfile = await toVFile(file);
  const ast = await processor.parse(vfile);
  console.log(await processor.run(ast, vfile));
}

import { TFile } from 'obsidian';
import { markdownToAst } from '../processor';
import { toVFile } from '../file';

export async function exportAstToConsole(file: TFile): Promise<void> {
  const ast = await markdownToAst.parse(await toVFile(file));
  console.log(ast);
}

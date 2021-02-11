import { Notice, Plugin, TFile } from 'obsidian';
import { TeXPrinter } from './texPrinter';
import { remote } from 'electron';
import * as fs from 'fs';
import { ensureSettings, ExportToTexSettings } from './settings';
import { promisify } from 'util';
import { ExportToTeXSettingTab } from './settingsTabs';

export default class ExportToTeXPlugin extends Plugin {
  settings: ExportToTexSettings = new ExportToTexSettings();

  public async onload(): Promise<void> {
    const settings = await this.loadData();
    if (settings !== null) {
      this.settings = ensureSettings(settings);
    }

    this.addCommand({
      id: 'export-to-tex',
      name: 'Export To TeX',
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file !== null) {
          if (!checking) {
            this.exportToFile(file).catch(this.onExportError);
          }
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: 'export-tex-to-clipboard',
      name: 'Export To Clipboard',
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file !== null) {
          if (!checking) {
            this.exportToClipboard(file).catch(this.onExportError);
          }
          return true;
        }
        return false;
      },
    });

    this.addSettingTab(new ExportToTeXSettingTab(this.app, this));
  }

  async exportToFile(file: TFile): Promise<void> {
    const { filePath, canceled } = await remote.dialog.showSaveDialog({
      filters: [
        {
          name: 'TeX',
          extensions: ['tex'],
        },
      ],
    });

    if (canceled || filePath === undefined) return;

    const printer = new TeXPrinter(
      this.app.metadataCache,
      this.settings,
      filePath,
    );
    const contents = await printer.toTex(file);

    await promisify(fs.writeFile)(filePath, contents);

    // eslint-disable-next-line no-new
    new Notice(`Tex exported to ${filePath}`);
  }

  async exportToClipboard(file: TFile): Promise<void> {
    const printer = new TeXPrinter(this.app.metadataCache, this.settings);
    const contents = await printer.toTex(file);
    remote.clipboard.writeText(contents);
    // eslint-disable-next-line no-new
    new Notice(`Tex exported to clipboard`);
  }

  onExportError(e: Error): void {
    console.log(e);
    // eslint-disable-next-line no-new
    new Notice(
      `Error of type "${e.name} occurred on export. See console for details."`,
    );
  }
}

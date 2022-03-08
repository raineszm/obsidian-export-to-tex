import { Notice, Plugin, TFile } from 'obsidian';
import { TeXPrinter } from './texPrinter';
import { ensureSettings, ExportToTexSettings } from './plugin/settings';
import { ExportToTeXSettingTab } from './plugin/settingsTabs';
import { exportAstToConsole, exportModifiedAstToConsole } from './debug/ast';

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

    if (DEBUG) {
      this.addCommand({
        id: 'export-ast-to-console',
        name: 'Show AST',
        checkCallback: (checking: boolean) => {
          const file = this.app.workspace.getActiveFile();
          if (file !== null) {
            if (!checking) {
              exportAstToConsole(file).catch(this.onExportError);
            }
            return true;
          }
          return false;
        },
      });

      this.addCommand({
        id: 'export-modified-ast-to-console',
        name: 'Show modified AST',
        checkCallback: (checking: boolean) => {
          const file = this.app.workspace.getActiveFile();
          if (file !== null) {
            if (!checking) {
              exportModifiedAstToConsole(
                file,
                this.settings,
                this.app.metadataCache,
              ).catch(this.onExportError);
            }
            return true;
          }
          return false;
        },
      });
    }

    this.addSettingTab(new ExportToTeXSettingTab(this.app, this));
  }

  async exportToFile(file: TFile): Promise<void> {
    // const directory =
    //   this.settings.defaultExportDirectory.length > 0
    //     ? this.settings.defaultExportDirectory
    //     : (file.vault.adapter as FileSystemAdapter).getBasePath();
    try {
      const fileHandle = await window.showSaveFilePicker({
        types: [
          {
            description: 'LaTeX',
            accept: {
              'application/x-tex': ['.tex'],
            },
          },
        ],
      });

      const printer = new TeXPrinter(
        this.app.metadataCache,
        this.settings,
        fileHandle.name,
      );
      const contents = await printer.toTex(file);

      const writeable = await fileHandle.createWritable();
      await writeable.write(contents);
      writeable.close();

      // eslint-disable-next-line no-new
      new Notice(`Tex exported to ${fileHandle.name}`);
    } catch (AbortError) {
      return;
    }
  }

  async exportToClipboard(file: TFile): Promise<void> {
    const printer = new TeXPrinter(this.app.metadataCache, this.settings);
    const contents = await printer.toTex(file);
    await navigator.clipboard.writeText(contents);
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

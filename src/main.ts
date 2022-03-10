import { MarkdownView, Notice, Plugin, TFile } from 'obsidian';
import { TeXPrinter } from './texPrinter';
import { ensureSettings, ExportToTexSettings } from './plugin/settings';
import { ExportToTeXSettingTab } from './plugin/settingsTabs';
import { exportAstToConsole, exportModifiedAstToConsole } from './debug/ast';
import { ObsidianVFile, toVFile, vfileFromSelection } from './file';

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
            this.exportFileToFile(file).catch(this.onExportError);
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
            this.exportFileToClipboard(file).catch(this.onExportError);
          }
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: 'export-selection-to-tex',
      name: 'Export Selection To TeX',
      checkCallback: (checking: boolean) => {
        const view =
          this.app.workspace.getActiveViewOfType<MarkdownView>(MarkdownView);
        if (view !== null) {
          if (!checking) {
            this.exportSelectionToFile(view).catch(this.onExportError);
          }
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: 'export-selection-tex-to-clipboard',
      name: 'Export Selection To Clipboard',
      checkCallback: (checking: boolean) => {
        const view =
          this.app.workspace.getActiveViewOfType<MarkdownView>(MarkdownView);
        if (view !== null) {
          if (!checking) {
            this.exportSelectionToClipboard(view).catch(this.onExportError);
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

  async exportFileToFile(file: TFile): Promise<void> {
    await this.exportToFile(await toVFile(file));
  }

  async exportSelectionToFile(view: MarkdownView): Promise<void> {
    await this.exportToFile(vfileFromSelection(view));
  }

  async exportToFile(vfile: ObsidianVFile): Promise<void> {
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
      const contents = await printer.toTex(vfile);

      const writeable = await fileHandle.createWritable();
      await writeable.write(contents);
      writeable.close();

      // eslint-disable-next-line no-new
      new Notice(`Tex exported to ${fileHandle.name}`);
    } catch (AbortError) {
      return;
    }
  }

  async exportFileToClipboard(file: TFile): Promise<void> {
    await this.exportToClipboard(await toVFile(file));
  }

  async exportSelectionToClipboard(view: MarkdownView): Promise<void> {
    await this.exportToClipboard(vfileFromSelection(view));
  }

  async exportToClipboard(vfile: ObsidianVFile): Promise<void> {
    const printer = new TeXPrinter(this.app.metadataCache, this.settings);
    const contents = await printer.toTex(vfile);
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

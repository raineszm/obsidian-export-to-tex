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
    this.addCommands();

    if (DEBUG) {
      this.addDebugCommands();
    }

    this.addSettingTab(new ExportToTeXSettingTab(this.app, this));
  }

  private addCommands() {
    // Note we use arrow functions here to make sure we're always getting the currently
    // defined versions of things
    this.addExportCommand(
      'export-to-tex',
      'Export To TeX',
      () => this.app.workspace.getActiveFile(),
      (x) => this.exportFileToFile(x),
    );

    this.addExportCommand(
      'export-tex-to-clipboard',
      'Export To Clipboard',
      () => this.app.workspace.getActiveFile(),
      (x) => this.exportFileToClipboard(x),
    );

    this.addExportCommand(
      'export-selection-to-tex',
      'Export Selection To TeX',
      () => this.app.workspace.getActiveViewOfType(MarkdownView),
      (x) => this.exportSelectionToFile(x),
    );

    this.addExportCommand(
      'export-selection-tex-to-clipboard',
      'Export Selection To Clipboard',
      () => this.app.workspace.getActiveViewOfType(MarkdownView),
      (x) => this.exportSelectionToClipboard(x),
    );
  }

  private addDebugCommands() {
    this.addExportCommand(
      'export-ast-to-console',
      'Show AST',
      () => this.app.workspace.getActiveFile(),
      exportAstToConsole,
    );

    this.addExportCommand(
      'export-modified-ast-to-console',
      'Show modified AST',
      () => this.app.workspace.getActiveFile(),
      (file) =>
        exportModifiedAstToConsole(file, this.settings, this.app.metadataCache),
    );
  }

  private addExportCommand<TFileOrView>(
    id: string,
    name: string,
    getFileOrView: () => TFileOrView | null,
    doExport: (x: TFileOrView) => Promise<void>,
  ) {
    this.addCommand({
      id,
      name,
      checkCallback: (checking: boolean) => {
        const fileOrView = getFileOrView();
        if (fileOrView !== null) {
          if (!checking) {
            doExport(fileOrView).catch(this.onExportError);
          }
          return true;
        }
        return false;
      },
    });
  }

  async exportFileToFile(file: TFile): Promise<void> {
    await this.exportToFile(await toVFile(file));
  }

  async exportSelectionToFile(view: MarkdownView): Promise<void> {
    await this.exportToFile(vfileFromSelection(view));
  }

  async exportToFile(vfile: ObsidianVFile): Promise<void> {
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

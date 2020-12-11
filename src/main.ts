import {
  App,
  ButtonComponent,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from 'obsidian';
import { TeXPrinter } from './texPrinter';
import { remote } from 'electron';
import * as fs from 'fs';
import { ExportToTexSettings } from './settings';
import { promisify } from 'util';
import { log, LogLevelOptions, LogLevelString } from './log';

export default class ExportToTeXPlugin extends Plugin {
  settings: ExportToTexSettings = new ExportToTexSettings();

  public async onload(): Promise<void> {
    const settings = await this.loadData();
    if (settings !== null) {
      this.settings = settings;
    }
    log.setLevel(this.settings.logLevel);

    this.addCommand({
      id: 'export-to-tex',
      name: 'Export To TeX',
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file !== null) {
          if (!checking) {
            this.exportToFile(file).catch(console.log);
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
            this.exportToClipboard(file).catch(console.log);
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

    const printer = new TeXPrinter(this.app.metadataCache, this.settings);
    const contents = await printer.print(file);

    await promisify(fs.writeFile)(filePath, contents);
  }

  async exportToClipboard(file: TFile): Promise<void> {
    const printer = new TeXPrinter(this.app.metadataCache, this.settings);
    const contents = await printer.print(file);
    remote.clipboard.writeText(contents);
  }
}

class ExportToTeXSettingTab extends PluginSettingTab {
  constructor(app: App, readonly plugin: ExportToTeXPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for exporting to TeX' });

    new Setting(containerEl)
      .setName('Ref command')
      .setDesc(
        'Command to use when converting links to headings/blocks to refs.',
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings.refCommand)
          .onChange(async (value) => {
            this.plugin.settings.refCommand = value;
            await this.plugin.saveData(this.plugin.settings);
          }),
      );

    new Setting(containerEl)
      .setName('Debug')
      .setDesc('Print debug information to console?')
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(LogLevelOptions)
          .setValue(this.plugin.settings.logLevel)
          .onChange(async (value) => {
            const level = value as LogLevelString;
            this.plugin.settings.logLevel = level;
            log.setLevel(level);
            await this.plugin.saveData(this.plugin.settings);
          });
      });

    new ButtonComponent(containerEl)
      .setButtonText('Reset to default')
      .onClick(async () => {
        await remote.dialog
          .showMessageBox({
            title: 'Reset settings to default?',
            type: 'question',
            message: 'Are you sure?',
            buttons: ['No', 'Yes'],
          })
          .then(async (value) => {
            if (value.response === 0) return;
            this.plugin.settings = new ExportToTexSettings();
            await this.plugin.saveData(this.plugin.settings);
            this.display();
          });
      });
  }
}

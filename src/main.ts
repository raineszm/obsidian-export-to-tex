import { Plugin, PluginSettingTab, TFile } from 'obsidian';
import { TeXPrinter } from './texPrinter';
import { remote } from 'electron';
import * as fs from 'fs';
import { promisify } from 'util';

export default class ExportToTeXPlugin extends Plugin {
  public onload(): void {
    console.log('loading plugin');

    this.addCommand({
      id: 'export-to-tex',
      name: 'Export To TeX',
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file !== null) {
          if (!checking) {
            this.doExport(file).catch(console.log);
          }
          return true;
        }
        return false;
      },
    });

    this.addSettingTab(new ExportToTeXSettingTab(this.app, this));
  }

  async doExport(file: TFile): Promise<void> {
    const { filePath, canceled } = await remote.dialog.showSaveDialog({
      filters: [
        {
          name: 'TeX',
          extensions: ['tex'],
        },
      ],
    });

    if (canceled || filePath === undefined) return;

    const printer = new TeXPrinter(this.app.metadataCache);
    const contents = await printer.print(file);

    await promisify(fs.writeFile)(filePath, contents);
  }
}

class ExportToTeXSettingTab extends PluginSettingTab {
  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings exporting to TeX' });

    // new Setting(containerEl)
    // 	.setName('Setting #1')
    // 	.setDesc('It\'s a secret')
    // 	.addText(text => text.setPlaceholder('Enter your secret')
    // 		.setValue('')
    // 		.onChange((value) => {
    // 			console.log('Secret: ' + value);
    // 		}));
  }
}

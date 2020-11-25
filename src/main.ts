import { MarkdownView, Plugin, PluginSettingTab } from 'obsidian';
import { TeXPrinter } from './texPrinter';

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
            const printer = new TeXPrinter(this.app.metadataCache);
            printer
              .resolveEmbeds(file, TeXPrinter.START)
              .then(console.log)
              .catch((_any) => console.log('Error!'));
          }
          return true;
        }
        return false;
      },
    });

    this.addSettingTab(new ExportToTeXSettingTab(this.app, this));
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

import {
  App,
  ButtonComponent,
  FileSystemAdapter,
  PluginSettingTab,
  Setting,
  TextComponent,
} from 'obsidian';
import { remote } from 'electron';
import {
  ExportToTexSettings,
  ImagePathSettingDescriptions,
  ImagePathSettings,
} from './settings';
import ExportToTeXPlugin from './main';

export class ExportToTeXSettingTab extends PluginSettingTab {
  constructor(app: App, readonly plugin: ExportToTeXPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for exporting to TeX' });

    new Setting(containerEl)
      .setName('Generate labels and refs')
      .setDesc(
        'Automatically generate TeX labels and refs for blocks and headings?',
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.generateLabels)
          .onChange(async (value) => {
            this.plugin.settings.generateLabels = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });

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
      .setName('Additional math environments')
      .setDesc(
        'Additional environments which trigger math content without needing \\[...\\]' +
          ' (one per line)',
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.additionalMathEnvironments.join('\n'))
          .onChange(async (value) => {
            this.plugin.settings.additionalMathEnvironments = value
              .split('\n')
              .map((x) => x.trim())
              .filter((x) => x.length > 0);
            await this.plugin.saveData(this.plugin.settings);
          });
      });

    new Setting(containerEl)
      .setName('Default to Equation')
      .setDesc('Convert display math to equation environemtns')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.defaultToEquation)
          .onChange(async (value) => {
            this.plugin.settings.defaultToEquation = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });

    new Setting(containerEl)
      .setName('Compress newlines')
      .setDesc(
        'Reduce any instance of 2 or more blank lines to a single blank line',
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.compressNewlines)
          .onChange(async (value) => {
            this.plugin.settings.compressNewlines = value;
            await this.plugin.saveData(this.plugin.settings);
          });
      });

    new Setting(containerEl)
      .setName('Image path format')
      .setDesc(
        [
          'Specifies how the path for images should be written in exported \\includegraphics calls',
        ].join('\n'),
      )
      .addDropdown((dropdown) => {
        for (let i = 0; i < ImagePathSettingDescriptions.length; i++) {
          dropdown.addOption(i.toString(), ImagePathSettingDescriptions[i]);
        }
        dropdown
          .setValue(this.plugin.settings.imagePathSettings.toString())
          .onChange(async (value) => {
            this.plugin.settings.imagePathSettings = Number.parseInt(
              value,
            ) as ImagePathSettings;
            await this.plugin.saveData(this.plugin.settings);
          });
      });

    let textEl: TextComponent;

    new Setting(containerEl)
      .setName('Default export directory')
      .setDesc(
        'Default directory to save TeX files to. If blank will default to vault root.',
      )
      .addText((text) => {
        textEl = text
          .setPlaceholder('Default (Vault root)')
          .setValue(this.plugin.settings.defaultExportDirectory);
        textEl.inputEl.disabled = true;
      })
      .addButton((button) => {
        button.setButtonText('Choose').onClick(async () => {
          const { filePaths, canceled } = await remote.dialog.showOpenDialog({
            defaultPath: (this.app.vault
              .adapter as FileSystemAdapter).getBasePath(),
            properties: ['createDirectory', 'openDirectory'],
          });

          if (canceled) return;

          const exportPath = filePaths[0];
          textEl.setValue(exportPath);
          this.plugin.settings.defaultExportDirectory = exportPath;
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

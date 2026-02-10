import { App, PluginSettingTab, Setting } from "obsidian";
import EasyPaperImporter from "./main";

export interface EasyPaperSettings {
	/** Folder in the vault where paper notes are saved. */
	paperFolder: string;
}

export const DEFAULT_SETTINGS: EasyPaperSettings = {
	paperFolder: "Papers",
};

export class EasyPaperSettingTab extends PluginSettingTab {
	plugin: EasyPaperImporter;

	constructor(app: App, plugin: EasyPaperImporter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Easy Paper Importer" });

		new Setting(containerEl)
			.setName("Paper folder")
			.setDesc("Folder where imported paper notes will be created.")
			.addText((text) =>
				text
					.setPlaceholder("Papers")
					.setValue(this.plugin.settings.paperFolder)
					.onChange(async (value) => {
						this.plugin.settings.paperFolder = value.trim() || "Papers";
						await this.plugin.saveSettings();
					})
			);
	}
}

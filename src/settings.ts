import { App, PluginSettingTab, Setting } from "obsidian";
import EasyPaperImporter from "./main";

export interface EasyPaperSettings {
	/** Folder in the vault where paper notes are saved. */
	paperFolder: string;
	noteTitleFormat: string;
	metadataFields: string[];
	includeImportDate: boolean;
	confirmDuplicateImports: boolean;
}

export const DEFAULT_SETTINGS: EasyPaperSettings = {
	paperFolder: "Papers",
	noteTitleFormat: "{{first_authors}}_{{year}}",
	metadataFields: ['title', 'authors', 'year', 'doi'],
	includeImportDate: true,
	confirmDuplicateImports: true,
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

		new Setting(containerEl).setName("Setup basics").setHeading();
		containerEl.createEl("p", {
			text: "Pick where to import your papers and how to name them, etc."
		});

		new Setting(containerEl)
			.setName("Folder path")
			.setDesc("Folder where imported paper notes will be created.")
			.addText((text) => text
					.setPlaceholder("Papers")
					.setValue(this.plugin.settings.paperFolder)
					.onChange(async (value) => {
						this.plugin.settings.paperFolder = value.trim() || "Papers";
						await this.plugin.saveSettings();
					}));
		
		new Setting(containerEl)
			.setName("Note title")
			.setDesc("Define the note title format using metadata keys in double curly braces. E.g. {{title}} - {{authors}} ({{year}}). The default behaviour of {{authors}} is to only include the first author followed.")
			.addText((text) => text
					.setPlaceholder("{{first_authors}}_{{year}}")
					.setValue(this.plugin.settings.noteTitleFormat)
					.onChange(async (value) => {
						this.plugin.settings.noteTitleFormat = value.trim() || "{{first_authors}}_{{year}}";
						await this.plugin.saveSettings();
					}));

		new Setting(containerEl).setName("Metadata").setHeading();
		containerEl.createEl("p", {
			text: "It is important to decide on which meta data you want early to avoid any unnecessary hassle later. Only the main ones should be fine (as in the default)."
		});

		new Setting(containerEl)
			.setName('Note metadata fields')
			.setDesc('Comma-separated list of metadata keys to include. Incorrect metadata keys will be ignored.')
			.addText(t => t
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('title, authors, doi, year')
				.setValue(this.plugin.settings.metadataFields.join(', '))
				.onChange(async v => {
				this.plugin.settings.metadataFields = v.split(',').map(s => s.trim()).filter(Boolean);
				await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include import date')
			.setDesc('Toggle including the date when the paper was imported as part of the note metadata. This does not modify existing imports and only applies to imports when the setting is enabled.')
			.addToggle(t => t
				.setValue(this.plugin.settings.includeImportDate)
				.onChange(async v => {
					this.plugin.settings.includeImportDate = v;
					await this.plugin.saveSettings();
			}));

		new Setting(containerEl).setName("Extras").setHeading();
		containerEl.createEl("p", {
			text: "More functionality."
		});

		new Setting(containerEl)
			.setName('Confirm duplicate imports')
			.setDesc('Enable a confirmation prompt when importing a paper that has already been imported before. Utilizes title and/or DOI to detect duplicated.')
			.addToggle(t => t
				.setValue(this.plugin.settings.confirmDuplicateImports)
				.onChange(async v => {
					this.plugin.settings.confirmDuplicateImports = v;
					await this.plugin.saveSettings();
			}));
	}
}

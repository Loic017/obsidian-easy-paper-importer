import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, EasyPaperSettings, EasyPaperSettingTab } from "./settings";
import { DoiInputModal } from "./ui/doi-modal";

export default class EasyPaperImporter extends Plugin {
	settings: EasyPaperSettings;

	async onload() {
		await this.loadSettings();

		// Ribbon icon to quickly import a paper
		this.addRibbonIcon("file-input", "Import paper from DOI", () => {
			this.openDoiModal();
		});

		// Command palette entry
		this.addCommand({
			id: "import-paper-from-doi",
			name: "Import paper from DOI",
			callback: () => this.openDoiModal(),
		});

		// Settings tab
		this.addSettingTab(new EasyPaperSettingTab(this.app, this));
	}

	onunload() {}

	/**
	 * Open the DOI input modal and handle the result.
	 */
	private openDoiModal(): void {
		new DoiInputModal(this.app, this.settings.paperFolder, async (filePath) => {
			// Open the newly created note
			const file = this.app.vault.getAbstractFileByPath(filePath);
			if (file) {
				await this.app.workspace.openLinkText(filePath, "", true);
			}
		}).open();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData() as Partial<EasyPaperSettings>
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

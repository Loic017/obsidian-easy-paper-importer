import { Plugin, Notice, TFile } from "obsidian";
import { DEFAULT_SETTINGS, EasyPaperSettings, EasyPaperSettingTab } from "./settings";
import { DoiInputModal } from "./ui/doi-modal";
import { PaperIndex } from "./indexer";

export default class EasyPaperImporter extends Plugin {
	settings: EasyPaperSettings;
	paperIndex: PaperIndex;

	async onload() {
		await this.loadSettings();

		// Initialize paper index
		this.paperIndex = new PaperIndex(this);
		await this.paperIndex.load();

		// Keep index in sync with vault changes
		this.registerEvent(this.app.vault.on("create", (f) => {
			if (f instanceof TFile) this.paperIndex.updateIndexForFile(f);
		}));
		this.registerEvent(this.app.vault.on("delete", (f) => {
			this.paperIndex.removeFromIndex(f);
		}));
		this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
			if (typeof oldPath === "string") {
				this.paperIndex.removeFromIndex({ path: oldPath });
			} else {
				this.paperIndex.removeFromIndex(oldPath);
			}
			if (file instanceof TFile) this.paperIndex.updateIndexForFile(file);
		}));

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

		// Rebuild paper index command
		this.addCommand({
			id: "rebuild-paper-index",
			name: "Rebuild paper index",
			callback: async () => {
				await this.paperIndex.rebuild();
				new Notice("Paper index rebuilt.");
			},
		});

		// Settings tab
		this.addSettingTab(new EasyPaperSettingTab(this.app, this));
	}

	onunload() {}

	/**
	 * Open the DOI input modal and handle the result.
	 */
	private openDoiModal(): void {
		new DoiInputModal(this.app, this.settings, this, async (filePath) => {
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

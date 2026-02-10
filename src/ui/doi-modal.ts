import { App, Modal, Setting, Notice } from "obsidian";
import { EasyPaperSettings } from "../settings";
import { fetchPaperMetadata } from "../doi";
import { createPaperNote } from "../note";
import { ConfirmDuplicateModal } from "./confirm-duplicate-modal";

/**
 * Modal that prompts the user for a DOI and imports the paper.
 */
export class DoiInputModal extends Modal {
	private doiInput = "";
	private settings: EasyPaperSettings;
	private plugin: any;
	private onSuccess: (filePath: string) => void;

	constructor(app: App, settings: EasyPaperSettings, plugin: any, onSuccess: (filePath: string) => void) {
		super(app);

		// ???
		this.settings = settings;
		this.plugin = plugin;
		this.onSuccess = onSuccess;
	} 

	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Import paper from DOI" });
		contentEl.createEl("p", {
			text: "Enter a DOI (e.g. 10.1038/s41586-020-2649-2) or a full DOI URL.",
			cls: "setting-item-description",
		});

		new Setting(contentEl)
			.setName("DOI")
			.addText((text) => {
				text.setPlaceholder("10.1038/s41586-020-2649-2");
				text.onChange((value) => {
					this.doiInput = value;
				});
				// Allow Enter to submit
				text.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
					if (e.key === "Enter") {
						e.preventDefault();
						this.submit();
					}
				});
				// Focus the input after a small delay so the modal is rendered
				setTimeout(() => text.inputEl.focus(), 50);
			});

		new Setting(contentEl)
			.addButton((btn) => {
				btn.setButtonText("Import")
					.setCta()
					.onClick(() => this.submit());
			});
	}

	private async submit(): Promise<void> {
		const doi = this.doiInput.trim();
		if (!doi) {
			new Notice("Please enter a DOI.");
			return;
		}

		new Notice("Fetching paper metadata…");

		try {
			const paper = await fetchPaperMetadata(doi);

			// Duplicate check before creating the note
			const dup = this.plugin?.paperIndex?.findDuplicate({ doi: paper.doi, title: paper.title });
			if (dup && this.plugin?.settings?.confirmDuplicateImports) {
				const confirmed = await new ConfirmDuplicateModal(this.app, dup.path, dup.type).openAndWait();
				if (!confirmed) {
					new Notice("Import cancelled (duplicate detected).");
					return;
				}
			}

			const filePath = await createPaperNote(this.app, paper, this.settings);

			new Notice(`Imported: ${paper.title}`);
			this.close();
			this.onSuccess(filePath);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			new Notice(`Error importing paper: ${message}`);
			console.error("Easy Paper Importer: Error importing paper", error);
		}
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}

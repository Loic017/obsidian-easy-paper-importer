import { App, TFolder, normalizePath } from "obsidian";
import { PaperMetadata, normalizePaper } from "./types";
import { EasyPaperSettings } from "./settings";

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Sanitise a string for use as a filename.
 * Removes characters not allowed in filenames on most OSes.
 */
function sanitiseFilename(name: string): string {
	return (name ?? "")
		.replace(/[\\/:*?"<>|]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 200); // cap length
}

/** Escape double-quotes inside a YAML string value. */
function yamlStr(value: string): string {
	return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Render a YAML list (returns empty string if array is empty). */
function yamlList(key: string, items: string[], quote = true): string {
	if (items.length === 0) return "";
	const entries = items.map((v) => `  - ${quote ? yamlStr(v) : v}`);
	return `${key}:\n${entries.join("\n")}`;
}

// ── Frontmatter ─────────────────────────────────────────────────────

/**
 * Build a plain object containing only the metadata fields the user
 * has selected, skipping any that are empty/missing.  Then serialise
 * to a YAML frontmatter string.
 */
function buildFrontmatter(paper: PaperMetadata, settings: EasyPaperSettings): string {
	const lines: string[] = ["---"];

	/**
	 * Each renderer checks for presence internally, so missing data
	 * is silently skipped.  The `paper` object is already normalised
	 * (strings default to "", arrays default to []).
	 */
	const fieldRenderers: Record<string, () => string | null> = {
		title: () =>
			paper.title ? `title: ${yamlStr(paper.title)}` : null,
		authors: () =>
			yamlList("authors", paper.authors) || null,
		journal: () =>
			paper.journal ? `journal: ${yamlStr(paper.journal)}` : null,
		year: () =>
			paper.year != null ? `year: ${paper.year}` : null,
		volume: () =>
			paper.volume ? `volume: ${yamlStr(paper.volume)}` : null,
		issue: () =>
			paper.issue ? `issue: ${yamlStr(paper.issue)}` : null,
		pages: () =>
			paper.pages ? `pages: ${yamlStr(paper.pages)}` : null,
		publisher: () =>
			paper.publisher ? `publisher: ${yamlStr(paper.publisher)}` : null,
		doi: () =>
			paper.doi ? `doi: ${yamlStr(paper.doi)}` : null,
		url: () =>
			paper.doiUrl ? `url: ${yamlStr(paper.doiUrl)}` : null,
		pdf: () =>
			paper.pdfUrl ? `pdf: ${yamlStr(paper.pdfUrl)}` : null,
		issn: () =>
			yamlList("issn", paper.issn) || null,
		tags: () => {
			const tags = paper.subjects.map((s) =>
				s.toLowerCase().replace(/\s+/g, "-"),
			);
			return yamlList("tags", tags, false) || null;
		},
	};

	for (const field of settings.metadataFields) {
		const render = fieldRenderers[field];
		if (!render) continue; // unknown key → skip
		const result = render();
		if (result) lines.push(result);
	}

	if (settings.includeImportDate) {
		lines.push(`date_imported: "${new Date().toISOString().split("T")[0]}"`);
	}

	lines.push("---");
	return lines.join("\n");
}

// ── Body ────────────────────────────────────────────────────────────

/**
 * Build the body content of the paper note.
 * All guards use the normalised paper so nothing can be undefined.
 */
function buildBody(paper: PaperMetadata): string {
	const sections: string[] = [];

	// This part will be expanded to allow for custom templates

	return sections.join("\n");
}

// ── Folder / file creation ──────────────────────────────────────────

/**
 * Ensure a folder exists in the vault, creating it if needed.
 */
async function ensureFolder(app: App, folderPath: string): Promise<void> {
	const normalised = normalizePath(folderPath);
	const existing = app.vault.getAbstractFileByPath(normalised);
	if (!existing) {
		await app.vault.createFolder(normalised);
	} else if (!(existing instanceof TFolder)) {
		throw new Error(`"${normalised}" exists but is not a folder.`);
	}
}

/**
 * Create a markdown note for a paper in the vault.
 *
 * The incoming `paper` is normalised first so every field is
 * guaranteed to have a safe default value.
 *
 * Returns the path of the created file.
 */
export async function createPaperNote(
	app: App,
	paper: PaperMetadata,
	settings: EasyPaperSettings,
): Promise<string> {
	// Normalise once — all downstream code can trust the shape
	const safe = normalizePaper(paper);

	await ensureFolder(app, settings.paperFolder);

	const filename = sanitiseFilename(safe.title) || "Untitled Paper";
	let filePath = normalizePath(`${settings.paperFolder}/${filename}.md`);

	// Avoid overwriting: add suffix if file already exists
	let counter = 1;
	while (app.vault.getAbstractFileByPath(filePath)) {
		filePath = normalizePath(`${settings.paperFolder}/${filename} (${counter}).md`);
		counter++;
	}

	const content = buildFrontmatter(safe, settings) + "\n\n" + buildBody(safe);
	await app.vault.create(filePath, content);

	return filePath;
}

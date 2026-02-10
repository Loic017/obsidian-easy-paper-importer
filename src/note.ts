import { App, TFolder, normalizePath } from "obsidian";
import { PaperMetadata } from "./types";

/**
 * Sanitise a string for use as a filename.
 * Removes characters not allowed in filenames on most OSes.
 */
function sanitiseFilename(name: string): string {
	return name
		.replace(/[\\/:*?"<>|]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 200); // cap length
}

/**
 * Build the frontmatter YAML block for a paper note.
 */
function buildFrontmatter(paper: PaperMetadata): string {
	const lines: string[] = ["---"];

	lines.push(`title: "${paper.title.replace(/"/g, '\\"')}"`);

	if (paper.authors.length > 0) {
		lines.push("authors:");
		for (const author of paper.authors) {
			lines.push(`  - "${author.replace(/"/g, '\\"')}"`);
		}
	}

	if (paper.journal) lines.push(`journal: "${paper.journal.replace(/"/g, '\\"')}"`);
	if (paper.year) lines.push(`year: ${paper.year}`);
	if (paper.volume) lines.push(`volume: "${paper.volume}"`);
	if (paper.issue) lines.push(`issue: "${paper.issue}"`);
	if (paper.pages) lines.push(`pages: "${paper.pages}"`);
	if (paper.publisher) lines.push(`publisher: "${paper.publisher.replace(/"/g, '\\"')}"`);

	lines.push(`doi: "${paper.doi}"`);
	lines.push(`url: "${paper.doiUrl}"`);
	lines.push(`pdf: "${paper.pdfUrl}"`);

	if (paper.issn.length > 0) {
		lines.push("issn:");
		for (const i of paper.issn) {
			lines.push(`  - "${i}"`);
		}
	}

	if (paper.subjects.length > 0) {
		lines.push("tags:");
		for (const subject of paper.subjects) {
			// Convert to kebab-case for tags
			const tag = subject.toLowerCase().replace(/\s+/g, "-");
			lines.push(`  - ${tag}`);
		}
	}

	lines.push(`date_imported: "${new Date().toISOString().split("T")[0]}"`);
	lines.push("---");

	return lines.join("\n");
}

/**
 * Build the body content of the paper note.
 */
function buildBody(paper: PaperMetadata): string {
	const sections: string[] = [];

	// Title
	sections.push(`# ${paper.title}`);
	sections.push("");

	// Authors
	if (paper.authors.length > 0) {
		sections.push("## Authors");
		sections.push(paper.authors.join(", "));
		sections.push("");
	}

	// Publication info
	const pubParts: string[] = [];
	if (paper.journal) pubParts.push(`**Journal:** ${paper.journal}`);
	if (paper.year) pubParts.push(`**Year:** ${paper.year}`);
	if (paper.volume) pubParts.push(`**Volume:** ${paper.volume}`);
	if (paper.issue) pubParts.push(`**Issue:** ${paper.issue}`);
	if (paper.pages) pubParts.push(`**Pages:** ${paper.pages}`);
	if (paper.publisher) pubParts.push(`**Publisher:** ${paper.publisher}`);

	if (pubParts.length > 0) {
		sections.push("## Publication info");
		sections.push(pubParts.join("  \n"));
		sections.push("");
	}

	// Abstract
	if (paper.abstract) {
		sections.push("## Abstract");
		sections.push(paper.abstract);
		sections.push("");
	}

	// Links
	sections.push("## Links");
	sections.push(`- [DOI](${paper.doiUrl})`);
	sections.push(`- [PDF](${paper.pdfUrl})`);
	sections.push("");

	// Notes section for user
	sections.push("## Notes");
	sections.push("");

	return sections.join("\n");
}

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
 * Returns the path of the created file.
 */
export async function createPaperNote(
	app: App,
	paper: PaperMetadata,
	folder: string
): Promise<string> {
	await ensureFolder(app, folder);

	const filename = sanitiseFilename(paper.title) || "Untitled Paper";
	let filePath = normalizePath(`${folder}/${filename}.md`);

	// Avoid overwriting: add suffix if file already exists
	let counter = 1;
	while (app.vault.getAbstractFileByPath(filePath)) {
		filePath = normalizePath(`${folder}/${filename} (${counter}).md`);
		counter++;
	}

	const content = buildFrontmatter(paper) + "\n\n" + buildBody(paper);
	await app.vault.create(filePath, content);

	return filePath;
}

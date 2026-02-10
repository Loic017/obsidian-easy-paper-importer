/**
 * Represents metadata for an academic paper fetched from a DOI.
 */
export interface PaperMetadata {
	title: string;
	authors: string[];
	abstract: string;
	journal: string;
	volume: string;
	issue: string;
	pages: string;
	year: number | null;
	month: number | null;
	doi: string;
	doiUrl: string;
	pdfUrl: string;
	publisher: string;
	issn: string[];
	subjects: string[];
}

/**
 * Normalise a raw/partial PaperMetadata object so every field has a
 * safe default value. Call this once after fetching to guarantee no
 * undefined properties downstream.
 */
export function normalizePaper(raw: Partial<PaperMetadata>): PaperMetadata {
	return {
		title: String(raw.title ?? ""),
		authors: (raw.authors ?? []).map((a) => String(a)),
		abstract: String(raw.abstract ?? ""),
		journal: String(raw.journal ?? ""),
		volume: String(raw.volume ?? ""),
		issue: String(raw.issue ?? ""),
		pages: String(raw.pages ?? ""),
		year: raw.year ?? null,
		month: raw.month ?? null,
		doi: String(raw.doi ?? ""),
		doiUrl: String(raw.doiUrl ?? ""),
		pdfUrl: String(raw.pdfUrl ?? ""),
		publisher: String(raw.publisher ?? ""),
		issn: (raw.issn ?? []).map((i) => String(i)),
		subjects: (raw.subjects ?? []).map((s) => String(s)),
	};
}

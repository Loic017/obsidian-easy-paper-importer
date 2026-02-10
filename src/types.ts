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

// The working group's genomics position on SATRE, with an entry for each
// difference and for each SATRE requirement it reviewed without change.
//
// The entries are written on the SATRE for Genomics page,
// src/content/docs/requirements/satre-genomics.mdx. Each one is an <Entry> tag
// that holds the fields of the entry, followed by its discussion:
//
//   <Entry id="2.1.G1" capability="2.1" title="Dynamic compute"
//     topic="Scalable compute" type="new" status="open"
//     statusText="Open (Meeting #7)." />
//
// This file reads those tags from the source of the page.

import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { satreRequirements, SATRE_VERSION } from './satre';
import type { SatreRequirement } from './satre';

export const EntryType = z.enum(['note', 'change', 'new', 'feedback', 'unchanged']);
export type EntryType = z.infer<typeof EntryType>;

export const EntryStatus = z.enum(['agreed', 'open', 'proposed']);
export type EntryStatus = z.infer<typeof EntryStatus>;

const HeadingLevel = z.coerce.number().pipe(z.literal([1, 2, 3, 4, 5, 6]));
type HeadingLevel = z.infer<typeof HeadingLevel>;

export const typeLabels = {
	note: 'Note',
	change: 'Change',
	new: 'New',
	feedback: 'Feedback',
	unchanged: 'No change',
} satisfies Record<EntryType, string>;

export const statusLabels = {
	agreed: 'Agreed',
	open: 'Open',
	proposed: 'Proposed',
} satisfies Record<EntryStatus, string>;

export interface GenomicsEntry {
	/**
	 * The key of the entry.
	 */
	id: string;
	/**
	 * The ID shown to readers, e.g. "2.1.G1" or "General".
	 */
	label: string;
	/**
	 * The title.
	 */
	title: string;
	/**
	 * The heading of the entry on the SATRE for Genomics page.
	 */
	heading: string;
	/**
	 * The heading level.
	 */
	level: HeadingLevel;
	/**
	 * The topic.
	 */
	topic: string;
	/**
	 * The entry type.
	 */
	type: EntryType;
	/**
	 * The entry status.
	 */
	status: EntryStatus;
	/**
	 * The status text.
	 */
	statusText: string;
	/**
	 * The SATRE requirement.
	 */
	requirement?: SatreRequirement;
	/**
	 * The capability of a new requirement, or of an entry about a whole capability, e.g. "2.1".
	 */
	capability?: string;
	/**
	 * The id of the entry heading on the SATRE for Genomics page.
	 */
	anchor: string;
}

export const isNew = (entry: GenomicsEntry) => entry.type === 'new';
export const isDifference = (entry: GenomicsEntry) => entry.type !== 'unchanged';

const capabilityIndexes = new Set(satreRequirements.map((r) => r.capabilityIndex));

const tagFields = z.object({
	id: z.string(),
	topic: z.string(),
	type: EntryType,
	status: EntryStatus,
	title: z.string(),
	heading: z.string().optional(),
	label: z.string().optional(),
	level: HeadingLevel.optional(),
	statusText: z.string(),
	capability: z
		.enum([...capabilityIndexes], { error: `SATRE v${SATRE_VERSION} has no capability with this index` })
		.optional(),
}).refine((f) => f.type !== 'new' || f.capability !== undefined, {
	path: ['capability'],
	error: 'a new requirement needs a capability, such as capability="2.1"',
});

const fail = (id: unknown, problem: string) =>
	new Error(`<Entry id="${id}"> on the SATRE for Genomics page: ${problem}`);

/**
 * Checks the attributes of a tag, and fills in the required fields.
 */
export function toEntry(attributes: Record<string, unknown>): GenomicsEntry {
	const parsed = tagFields.safeParse(attributes);
	if (!parsed.success) throw fail(attributes.id, z.prettifyError(parsed.error));
	const fields = parsed.data;

	return {
		...fields,
		label: fields.label ?? fields.id,
		heading: fields.heading ?? fields.title,
		level: fields.level ?? 4,
		requirement: satreRequirements.find((r) => r.id === fields.id),
		anchor: fields.id.toLowerCase().replaceAll('.', '-'),
	};
}

const page = await getEntry('docs', 'requirements/satre-genomics');
if (!page?.body) throw new Error('cannot read the source of the SATRE for Genomics page');

export const genomicsEntries: GenomicsEntry[] = [];
const ids = new Set<string>();
visit(unified().use(remarkParse).use(remarkMdx).parse(page.body), 'mdxJsxFlowElement', (node) => {
	if (node.name !== 'Entry') return;

	const attributes = Object.fromEntries(
		node.attributes.flatMap((a) => (a.type === 'mdxJsxAttribute' ? [[a.name, a.value]] : [])),
	);

	const entry = toEntry(attributes);
	if (ids.has(entry.id)) throw fail(entry.id, 'another entry has the same ID');

	ids.add(entry.id);
	genomicsEntries.push(entry);
});

/**
 * The topics of the entries.
 */
export const topicsOf = (entries: GenomicsEntry[]) => [...new Set(entries.map((e) => e.topic))];

const PAGE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/requirements/satre-genomics/`;

/**
 * Link to the full entry on the SATRE for Genomics page.
 */
export function fullEntryHref(entry: GenomicsEntry): string {
	return `${PAGE}#${entry.anchor}`;
}

/**
 * Link to the summary list on the SATRE for Genomics page.
 */
export function summaryHref(filter: { topic?: string; status?: EntryStatus }): string {
	const set = Object.entries(filter).filter((pair): pair is [string, string] => !!pair[1]);
	return `${PAGE}${set.length ? `?${new URLSearchParams(set)}` : ''}#summary`;
}

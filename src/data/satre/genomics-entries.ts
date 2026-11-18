// The working group's genomics position on SATRE with an entry for each difference.
//
// The entries are written on the SATRE for Genomics page,
// src/content/docs/requirements/satre-genomics.mdx. Each one is an <Entry> tag
// that holds the fields of the entry, followed by its discussion:
//
//   <Entry id="2.1.G1" title="Dynamic compute"
//     topic="compute" type="new" status="open"
//     statusText="Open (Meeting #7)." />
//
// This file reads those tags from the source of the page.

import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { satreById, satrePillars } from './satre';

export type Topic = 'governance' | 'compute' | 'workflow' | 'data' | 'cost' | 'egress' | 'general';

/**
 * The type of difference that an entry makes to SATRE.
 */
export type EntryType = 'note' | 'change' | 'new' | 'feedback' | 'unchanged';

/**
 * How far the working group has got with an entry.
 */
export type EntryStatus = 'agreed' | 'open' | 'proposed';

export interface GenomicsEntry {
	/**
	 * The unique key, e.g. "2.1.G1".
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
	 * The level of that heading. An entry under a capability is level 4.
	 */
	level: '3' | '4';
	/**
	 * The topic.
	 */
	topic: Topic;
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
	 * SATRE requirement IDs that this entry annotates.
	 */
	satre: string[];
	/**
	 * For a new requirement, the SATRE capability it belongs to, e.g. "2.1".
	 */
	capability?: string;
	/**
	 * The id of the entry's heading on the SATRE for Genomics page.
	 */
	anchor: string;
}

export const TOPICS: { id: Topic; label: string }[] = [
	{ id: 'governance', label: 'Governance and consent' },
	{ id: 'compute', label: 'Scalable compute' },
	{ id: 'workflow', label: 'Workflow management' },
	{ id: 'data', label: 'Storage and data lifecycle' },
	{ id: 'cost', label: 'Financial and cost management' },
	{ id: 'egress', label: 'Egress and output checking' },
	{ id: 'general', label: 'General' },
];

export const TYPES: { id: EntryType; label: string }[] = [
	{ id: 'note', label: 'Note' },
	{ id: 'change', label: 'Change' },
	{ id: 'new', label: 'New' },
	{ id: 'feedback', label: 'Feedback' },
	{ id: 'unchanged', label: 'No change' },
];

export const STATUSES: { id: EntryStatus; label: string }[] = [
	{ id: 'agreed', label: 'Agreed' },
	{ id: 'open', label: 'Open' },
	{ id: 'proposed', label: 'Proposed' },
];

const ids = <T extends string>(items: { id: T }[]) => items.map((item) => item.id) as [T, ...T[]];

// The fields that an <Entry> tag can have. A field that is not in this list, such as a
// misspelt name will fail the build.
const tagFields = z
	.object({
		id: z.string(),
		title: z.string(),
		heading: z.string().optional(),
		label: z.string().optional(),
		level: z.enum(['3', '4']).optional(),
		topic: z.enum(ids(TOPICS)),
		type: z.enum(ids(TYPES)),
		status: z.enum(ids(STATUSES)),
		statusText: z.string(),
	})
	.strict();

const page = await getEntry('docs', 'requirements/satre-genomics');
if (!page?.body) throw new Error('genomics-entries: cannot read the source of the SATRE for Genomics page');

const capabilityNames = new Map(satrePillars.flatMap((p) => p.capabilities.map((c) => [c.index, c.name] as const)));

export const genomicsEntries: GenomicsEntry[] = [];
visit(unified().use(remarkParse).use(remarkMdx).parse(page.body), 'mdxJsxFlowElement', (tag) => {
	if (tag.name !== 'Entry') return;
	// A field written as {an expression} has an object for its value, not
	// text. The check below then rejects it, because every field is text. A
	// spread such as {...fields} has no name, and the check rejects that too.
	const written = Object.fromEntries(
		tag.attributes.map((attribute) => ['name' in attribute ? attribute.name : '...', attribute.value]),
	);
	const fail = (problem: string) => new Error(`<Entry id="${written.id}"> on the SATRE for Genomics page: ${problem}`);
	const parsed = tagFields.safeParse(written);
	if (!parsed.success) throw fail(z.prettifyError(parsed.error));
	const fields = parsed.data;

	// The ID says which part of SATRE the entry is about:
	// - the ID of a SATRE requirement, such as "2.1.12", for an entry that
	//   annotates or changes that requirement;
	// - the index of a capability, such as "4.4", for an entry about that
	//   whole capability;
	// - a capability and then a name, such as "2.1.G1", for a new requirement;
	// - words, for a general note or a proposal that the group rejected.
	const isNew = fields.type === 'new';
	const wholeCapability = capabilityNames.get(fields.id);
	const capability = isNew ? fields.id.match(/^\d+\.\d+/)?.[0] : undefined;
	if (isNew && !capability) throw fail('the ID of a new requirement must start with its capability, as in "2.1.G1"');
	if (!isNew && /^\d/.test(fields.id) && !satreById.has(fields.id) && !wholeCapability) {
		throw fail('the ID is not a requirement or a capability in SATRE');
	}

	genomicsEntries.push({
		...fields,
		label: fields.label ?? fields.id,
		heading: fields.heading ?? wholeCapability ?? fields.title,
		level: fields.level ?? (wholeCapability ? '3' : '4'),
		satre: satreById.has(fields.id) ? [fields.id] : [],
		capability,
		anchor: fields.id.toLowerCase().replaceAll('.', '-'),
	});
});

export function typeLabel(type: EntryType): string {
	return TYPES.find((t) => t.id === type)!.label;
}

export function statusLabel(status: EntryStatus): string {
	return STATUSES.find((s) => s.id === status)!.label;
}

const PAGE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/requirements/satre-genomics/`;

/**
 * Link to a heading on the SATRE for Genomics page.
 */
export function pageHref(anchor: string): string {
	return `${PAGE}#${anchor}`;
}

/**
 * Link to the full entry on the SATRE for Genomics page.
 */
export function fullEntryHref(entry: GenomicsEntry): string {
	return pageHref(entry.anchor);
}

/**
 * Link to the summary list on the SATRE for Genomics page.
 */
export function summaryHref(filter: { topic?: Topic; status?: EntryStatus } = {}): string {
	const set = Object.entries(filter).filter(([, value]) => value);
	return `${PAGE}${set.length ? `?${new URLSearchParams(set)}` : ''}#summary`;
}

(function validate() {
	const ids = new Set<string>();
	const claimed = new Map<string, string>();
	for (const e of genomicsEntries) {
		if (ids.has(e.id)) throw new Error(`Duplicate genomics entry id: ${e.id}`);
		ids.add(e.id);
		for (const s of e.satre) {
			if (!satreById.has(s)) throw new Error(`Entry ${e.id} refers to unknown SATRE line ${s}`);
			if (claimed.has(s)) throw new Error(`SATRE ${s} is claimed by both ${claimed.get(s)} and ${e.id}`);
			claimed.set(s, e.id);
		}
		if (e.capability && ![...satreById.values()].some((r) => r.capabilityIndex === e.capability)) {
			throw new Error(`Entry ${e.id} refers to unknown SATRE capability ${e.capability}`);
		}
	}
})();

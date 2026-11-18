// Groups the genomics entries by SATRE capability for the SATRE map,
// or by topic for the lists in the report.

import { satrePillars } from './satre';
import type { SatreRequirement } from './satre';
import { genomicsEntries, TOPICS, statusLabel } from './genomics-entries';
import type { GenomicsEntry, EntryStatus, Topic } from './genomics-entries';

export const isDifference = (entry: GenomicsEntry) => entry.type !== 'unchanged';

/**
 * The statuses supported.
 */
export const STATUS_ORDER: EntryStatus[] = ['agreed', 'open', 'proposed'];

export type StatusCounts = Record<EntryStatus, number>;

export function countByStatus(entries: GenomicsEntry[]): StatusCounts {
	return {
		agreed: entries.filter((e) => e.status === 'agreed').length,
		open: entries.filter((e) => e.status === 'open').length,
		proposed: entries.filter((e) => e.status === 'proposed').length,
	};
}

/**
 * The status phrase, e.g. "2 open · 4 proposed".
 */
export function statusPhrase(counts: StatusCounts): string {
	return STATUS_ORDER.filter((s) => counts[s] > 0)
		.map((s) => `${counts[s]} ${statusLabel(s).toLowerCase()}`)
		.join(' · ');
}

/**
 * The plurality amount, e.g. plural(1, 'entry', 'entries') gives "1 entry".
 */
export function plural(n: number, one: string, many = `${one}s`): string {
	return `${n} ${n === 1 ? one : many}`;
}

const OUT_OF_SCOPE_PILLARS = new Set(['5']);
const entryForLine = new Map<string, GenomicsEntry>();
for (const e of genomicsEntries) for (const id of e.satre) entryForLine.set(id, e);

/**
 * The square on the SATRE map. It is either a SATRE requirement, with the
 * genomics entry on it if there is one, or a new genomics requirement, which
 * has an entry but no SATRE requirement.
 */
export interface MapCell {
	requirement?: SatreRequirement;
	entry?: GenomicsEntry;
}

export interface CapabilityGroup {
	/**
	 * The index, e.g. "2.1".
	 */
	index: string;
	/**
	 * The name.
	 */
	name: string;
	/**
	 * The SATRE requirements.
	 */
	cells: MapCell[];
	/**
	 * How many SATRE requirements the capability has.
	 */
	lineCount: number;
	/**
	 * The entries of these requirements.
	 */
	differences: GenomicsEntry[];
	/**
	 * The amount of the SATRE requirements that have a difference.
	 */
	lineDifferences: number;
	/**
	 * The amount of new genomics requirements.
	 */
	newCount: number;
}

export interface PillarGroup {
	index: string;
	name: string;
	capabilities: CapabilityGroup[];
}

export const pillarGroups: PillarGroup[] = satrePillars
	.filter((pillar) => !OUT_OF_SCOPE_PILLARS.has(pillar.index))
	.map((pillar) => ({
		index: pillar.index,
		name: pillar.name,
		capabilities: pillar.capabilities.map((capability) => {
			const lineCells: MapCell[] = capability.requirements.map((r) => ({
				requirement: r,
				entry: entryForLine.get(r.id),
			}));
			const fresh = genomicsEntries.filter((e) => e.type === 'new' && e.capability === capability.index);
			const onLines = [...new Set(lineCells.flatMap((cell) => (cell.entry ? [cell.entry] : [])))];

			return {
				index: capability.index,
				name: capability.name,
				cells: [...lineCells, ...fresh.map((e) => ({ entry: e }))],
				lineCount: capability.requirements.length,
				differences: [...onLines.filter(isDifference), ...fresh],
				lineDifferences: lineCells.filter((cell) => cell.entry && isDifference(cell.entry)).length,
				newCount: fresh.length,
			};
		}),
	}));

export const capabilityGroups: CapabilityGroup[] = pillarGroups.flatMap((pillar) => pillar.capabilities);

export interface TopicGroup {
	id: Topic;
	label: string;
	differences: GenomicsEntry[];
	reviewed: GenomicsEntry[];
	byStatus: StatusCounts;
}

export const topicGroups: TopicGroup[] = TOPICS.map((topic) => {
	const entries = genomicsEntries.filter((e) => e.topic === topic.id);
	const differences = entries.filter(isDifference);
	return {
		id: topic.id,
		label: topic.label,
		differences,
		reviewed: entries.filter((e) => !isDifference(e)),
		byStatus: countByStatus(differences),
	};
});

const lineCells = capabilityGroups.flatMap((capability) => capability.cells.filter((cell) => cell.requirement));
const linesOfType = (type: GenomicsEntry['type']) => lineCells.filter((cell) => cell.entry?.type === type).length;
const differences = genomicsEntries.filter(isDifference);

/**
 * Counts for captions and keys.
 */
export const totals = {
	/**
	 * SATRE requirements in the pillars that the group reviewed.
	 */
	lines: lineCells.length,
	/**
	 * SATRE requirements with no genomics note, change or feedback.
	 */
	asWritten: lineCells.filter((cell) => !cell.entry || !isDifference(cell.entry)).length,
	/**
	 * The notes.
	 */
	notes: linesOfType('note'),
	/**
	 * The changes.
	 */
	changes: linesOfType('change'),
	/**
	 * The feedback.
	 */
	feedback: linesOfType('feedback'),
	/**
	 * The new requirements.
	 */
	newRequirements: genomicsEntries.filter((e) => e.type === 'new').length,
	/**
	 * The differences, including general notes that belong to no SATRE requirement.
	 */
	differences: differences.length,
	/**
	 * The status grouping.
	 */
	byStatus: countByStatus(differences),
	/**
	 * The differences that have a square on the map.
	 */
	onMapByStatus: countByStatus(capabilityGroups.flatMap((capability) => capability.differences)),
};

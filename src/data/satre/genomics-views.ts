// Groups the genomics entries by SATRE capability for the SATRE map, and
// counts them by topic and status for the lists and the table in the report.

import { satrePillars } from './satre';
import { EntryStatus, genomicsEntries, isDifference, isNew, statusLabels } from './genomics-entries';
import type { GenomicsEntry } from './genomics-entries';

export const differences = genomicsEntries.filter(isDifference);

/**
 * How many of the entries have each value of a field.
 */
export function countBy<F extends 'topic' | 'status'>(entries: GenomicsEntry[], field: F) {
	const counts = new Map<GenomicsEntry[F], number>();
	for (const e of entries) counts.set(e[field], (counts.get(e[field]) ?? 0) + 1);
	return counts;
}

/**
 * The status phrase, e.g. "2 open · 4 proposed".
 */
export function statusPhrase(entries: GenomicsEntry[]): string {
	const counts = countBy(entries, 'status');
	return EntryStatus.options
		.flatMap((s) => (counts.has(s) ? [`${counts.get(s)} ${statusLabels[s].toLowerCase()}`] : []))
		.join(' · ');
}

/**
 * The plurality amount, e.g. plural(1, 'entry', 'entries') gives "1 entry".
 */
export function plural(n: number, one: string, many = `${one}s`): string {
	return `${n} ${n === 1 ? one : many}`;
}

export interface CapabilityGroup {
	index: string;
	name: string;
	requirements: (GenomicsEntry | undefined)[];
	newRequirements: GenomicsEntry[];
	differences: GenomicsEntry[];
	overview?: GenomicsEntry;
}

export interface PillarGroup {
	index: string;
	name: string;
	capabilities: CapabilityGroup[];
}

const entryForRequirement = new Map(differences.flatMap((e) => (e.requirement ? [[e.requirement.id, e]] : [])));

/**
 * The pillars of the map.
 */
export function pillarGroups(pillars?: string[]): PillarGroup[] {
	return satrePillars
		.filter((pillar) => !pillars || pillars.includes(pillar.index))
		.map((pillar) => ({
			index: pillar.index,
			name: pillar.name,
			capabilities: pillar.capabilities.map((capability) => {
				const requirements = capability.requirements.map((r) => entryForRequirement.get(r.id));
				const newRequirements = differences.filter((e) => isNew(e) && e.capability === capability.index);
				return {
					index: capability.index,
					name: capability.name,
					requirements,
					newRequirements,
					differences: [...requirements.filter((e) => e !== undefined), ...newRequirements],
					overview: differences.find((e) => !isNew(e) && !e.requirement && e.capability === capability.index),
				};
			}),
		}));
}

/**
 * The counts in the caption and the key of the SATRE map.
 */
export function mapTotals(pillars: PillarGroup[]) {
	const capabilities = pillars.flatMap((p) => p.capabilities);
	const requirements = capabilities.flatMap((c) => c.requirements);
	const asWritten = requirements.filter((e) => e === undefined).length;

	return {
		requirements: requirements.length,
		asWritten,
		changed: requirements.length - asWritten,
		newRequirements: capabilities.flatMap((c) => c.newRequirements).length,
		byStatus: countBy(capabilities.flatMap((c) => c.differences), 'status'),
	};
}

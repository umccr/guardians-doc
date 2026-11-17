// Loads the SATRE specification from the YAML file that SATRE itself publishes.
//
// The YAML is a byte-for-byte copy of docs/source/spec/specification.yaml at
// one release tag of https://github.com/sa-tre/satre-specification. The site
// parses it at build time, so every SATRE quotation on the site matches the
// published wording. scripts/satre/fetch-specification.mjs downloads it.

import { parse } from 'yaml';
import specificationYaml from './specification-v2.0.1.yaml?raw';

export const SATRE_VERSION = '2.0.1';
export const SATRE_SPEC_URL = 'https://satre-specification.readthedocs.io/en/v2.0.1/';
export const SATRE_LICENCE = 'CC BY 4.0';

export type SatreImportance = 'Mandatory' | 'Mandatory*' | 'Recommended' | 'Optional';

export interface SatreRequirement {
	/** For example "2.1.15". */
	id: string;
	/** For example "2". */
	pillarIndex: string;
	pillar: string;
	/** For example "2.1". */
	capabilityIndex: string;
	capability: string;
	statement: string;
	importance: SatreImportance;
}

export interface SatreCapability {
	index: string;
	name: string;
	requirements: SatreRequirement[];
}

export interface SatrePillar {
	index: string;
	name: string;
	capabilities: SatreCapability[];
}

interface RawRequirement {
	pillar: string;
	capability: string;
	capability_index: string;
	requirement_index: string;
	statement: string;
	importance: string;
}

const IMPORTANCE_LEVELS: readonly string[] = ['Mandatory', 'Mandatory*', 'Recommended', 'Optional'];

function load(): SatreRequirement[] {
	const raw = parse(specificationYaml) as { specification?: RawRequirement[] };
	if (!Array.isArray(raw.specification)) {
		throw new Error('SATRE specification YAML has no "specification" list.');
	}
	return raw.specification.map((r) => {
		// The YAML gives requirement indexes such as 1.1.01 unquoted. They
		// still parse as strings because "1.1.01" is not a valid number, but
		// check anyway so that a format change fails the build visibly.
		const id = String(r.requirement_index);
		if (!/^\d+\.\d+\.\d{2}$/.test(id)) {
			throw new Error(`Unexpected SATRE requirement index: ${id}`);
		}
		if (!IMPORTANCE_LEVELS.includes(r.importance)) {
			throw new Error(`Unexpected importance "${r.importance}" for SATRE ${id}`);
		}
		return {
			id,
			pillarIndex: id.split('.')[0],
			pillar: r.pillar,
			capabilityIndex: String(r.capability_index),
			capability: r.capability,
			// YAML folds long statements onto several lines, so collapse the
			// whitespace to get the sentence as SATRE renders it.
			statement: r.statement.replace(/\s+/g, ' ').trim(),
			importance: r.importance as SatreImportance,
		};
	});
}

export const satreRequirements: SatreRequirement[] = load();

export const satreById: ReadonlyMap<string, SatreRequirement> = new Map(
	satreRequirements.map((r) => [r.id, r]),
);

/** Pillars and capabilities in the order SATRE lists them. */
export const satrePillars: SatrePillar[] = (() => {
	const pillars: SatrePillar[] = [];
	for (const r of satreRequirements) {
		let pillar = pillars.find((p) => p.index === r.pillarIndex);
		if (!pillar) {
			pillar = { index: r.pillarIndex, name: r.pillar, capabilities: [] };
			pillars.push(pillar);
		}
		let capability = pillar.capabilities.find((c) => c.index === r.capabilityIndex);
		if (!capability) {
			capability = { index: r.capabilityIndex, name: r.capability, requirements: [] };
			pillar.capabilities.push(capability);
		}
		capability.requirements.push(r);
	}
	return pillars;
})();

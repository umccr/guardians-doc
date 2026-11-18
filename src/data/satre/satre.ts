// Loads the SATRE specification from the YAML file that SATRE publishes.

import { parse } from 'yaml';

export const SATRE_VERSION = '2.0.1';
export const SATRE_SPEC_URL = `https://satre-specification.readthedocs.io/en/v${SATRE_VERSION}/`;

const SPECIFICATION_URL = `https://raw.githubusercontent.com/sa-tre/satre-specification/v${SATRE_VERSION}/docs/source/spec/specification.yaml`;

const response = await fetch(SPECIFICATION_URL);
if (!response.ok) throw new Error(`Could not download ${SPECIFICATION_URL}: ${response.status}`);
const specificationYaml = await response.text();

export interface SatreRequirement {
	id: string;
	pillarIndex: string;
	pillar: string;
	capabilityIndex: string;
	capability: string;
	statement: string;
	importance: string;
}

type SpecificationRow = {
	pillar: string;
	capability: string;
	capability_index: string;
	requirement_index: string;
	statement: string;
	importance: string;
};

const { specification } = parse(specificationYaml) as { specification: SpecificationRow[] };

export const satreRequirements: SatreRequirement[] = specification.map((r) => ({
	id: r.requirement_index,
	pillarIndex: r.requirement_index.split('.')[0],
	pillar: r.pillar,
	capabilityIndex: r.capability_index,
	capability: r.capability,
	statement: r.statement.replace(/\s+/g, ' ').trim(),
	importance: r.importance,
}));

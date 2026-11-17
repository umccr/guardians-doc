// The working group's genomics position on SATRE, one entry per difference.
//
// Several places on the site read this file, so that they cannot disagree:
// - the SATRE map in the report "What makes a genomics TRE different";
// - the list of entries at the end of each topic section of that report, and
//   the table of counts at its end;
// - the summary table at the top of the "SATRE for Genomics" page.
// genomics-views.ts groups the entries for the first two.
//
// The full wording and discussion of each entry stays in
// src/content/docs/requirements/satre-genomics.mdx. When an entry's status
// or type changes there, change it here too. `anchor` is the heading id of
// the entry on that page.

import { satreById } from './satre';

export type Topic = 'governance' | 'compute' | 'workflow' | 'data' | 'cost' | 'egress' | 'general';

/** The kind of difference that an entry makes to SATRE. TYPES below says what each one means. */
export type EntryType = 'note' | 'change' | 'new' | 'feedback' | 'unchanged';

/** How far the working group has got with an entry. STATUSES below says what each one means. */
export type EntryStatus = 'agreed' | 'open' | 'proposed';

export interface GenomicsEntry {
	/** Unique key. Element ids on the page are built from it. */
	id: string;
	/** The ID shown to readers, for example "2.1.G1" or "General". */
	label: string;
	title: string;
	topic: Topic;
	type: EntryType;
	/** Replaces the standard type label, for example "New (mini-spec)". */
	typeLabel?: string;
	status: EntryStatus;
	/** The status as the SATRE for Genomics page states it. */
	statusText: string;
	/** SATRE requirement IDs that this entry annotates or changes. */
	satre?: string[];
	/** For a new requirement, the SATRE capability it belongs to, such as "2.1". */
	capability?: string;
	/** SATRE requirement IDs or entry ids that a reader should also see. */
	related?: string[];
	/** The genomics position, paraphrased in two or three sentences. */
	position: string;
	/** Heading id of the full entry on the SATRE for Genomics page. */
	anchor: string;
	/** Whether the entry appears in the summary table on that page. */
	listed: boolean;
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

// `meaning` is the sentence that the site shows to explain a type or a status,
// for example in the tooltips of the SATRE map's key. The same definitions are
// written out on the two pages, under "About this page" on SATRE for Genomics
// and under "Summary" and "Group methodology" in the report. Keep them in step.
export const TYPES: { id: EntryType; label: string; meaning: string }[] = [
	{
		id: 'note',
		label: 'Note',
		meaning: 'Keeps the SATRE requirement as it is. Genomics only makes it harder to meet.',
	},
	{
		id: 'change',
		label: 'Change',
		meaning: 'Alters the SATRE requirement for genomics, for example by raising its level.',
	},
	{
		id: 'new',
		label: 'New',
		meaning: 'A genomics requirement that SATRE does not have.',
	},
	{
		id: 'feedback',
		label: 'Feedback',
		meaning:
			'A concern with a SATRE requirement that is not specific to genomics. The group records it to raise with SATRE.',
	},
	{
		id: 'unchanged',
		label: 'No change',
		meaning: 'The group reviewed a draft change and decided against it.',
	},
];

export const STATUSES: { id: EntryStatus; label: string; meaning: string }[] = [
	{ id: 'agreed', label: 'Agreed', meaning: 'A working group meeting decided it.' },
	{ id: 'open', label: 'Open', meaning: 'A meeting discussed it but did not decide.' },
	{
		id: 'proposed',
		label: 'Proposed',
		meaning: 'It comes from a review document, and the group has not discussed it yet.',
	},
];

export const genomicsEntries: GenomicsEntry[] = [
	// General notes
	{
		id: 'general-expectations',
		label: 'General',
		title: 'Researcher and custodian expectations',
		topic: 'general',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #5)',
		related: ['nochange-1.3.05'],
		position:
			'Researchers want few barriers, and custodians want low risk. Genomic analysis needs more tools, compute and data movement than tabular work, so each control costs researchers more. The custodian should choose how strict the controls are, and make that choice visible to researchers.',
		anchor: 'researcher-and-custodian-expectations',
		listed: true,
	},
	{
		id: 'general-australian-context',
		label: 'General',
		title: 'Australian legal and ethical context',
		topic: 'governance',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #5), detail to follow',
		related: ['1.1.01'],
		position:
			'SATRE refers to UK law and UK bodies. An Australian TRE should read these against Australian obligations, such as the Privacy Act 1988, state health records laws, the NHMRC National Statement and Indigenous data governance. Some data must also stay in Australia.',
		anchor: 'australian-context',
		listed: true,
	},
	{
		id: 'general-shared-needs',
		label: 'General',
		title: 'Needs shared with other fields',
		topic: 'general',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #7), sorting to follow',
		position:
			'Medical imaging and AI research share many of these needs. Vendors are likely to meet the shared needs anyway, so the needs unique to genomics are the ones to spell out. The group has not yet sorted its list this way.',
		anchor: 'needs-shared-with-other-fields',
		listed: true,
	},
	{
		id: 'general-roles',
		label: 'General',
		title: 'Operator and custodian roles',
		topic: 'governance',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #7)',
		related: ['3.1.01'],
		position:
			'The TRE operator provides the tools that carry out governance decisions. The custodian and the accountable institutions make those decisions. The operator should not judge whether research is ethical, but must carry out the conditions that ethics approvals set.',
		anchor: 'operator-and-custodian-roles',
		listed: true,
	},

	// Pillar 1: Information Governance
	{
		id: '1.3.02',
		label: '1.3.02',
		title: 'Data processing assessment',
		topic: 'governance',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #5)',
		satre: ['1.3.02'],
		position:
			'Give extra weight to three risks that are stronger for genomic data. Re-identification risk does not fall over time, a genome reveals information about relatives, and removing direct identifiers does not make it anonymous.',
		anchor: '1302-data-processing-assessment',
		listed: true,
	},
	{
		id: '1.4.01',
		label: '1.4.01',
		title: 'Per-participant consent',
		topic: 'governance',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #5)',
		satre: ['1.4.01'],
		position:
			'Consent often differs between participants in one dataset, so checks need to work for each participant, not only for each project. Cohort construction chooses which participants a project may use, before data reaches the TRE.',
		anchor: '1401-legal-financial-and-ethical-checks',
		listed: true,
	},
	{
		id: '1.4.04',
		label: '1.4.04',
		title: 'End of project',
		topic: 'data',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #5). Project model open',
		satre: ['1.4.04'],
		position:
			'A project is a time-limited period of access, not the dataset, which the custodian holds before and after it. At the end, remove access and working data, and send derived data worth keeping out through egress.',
		anchor: '1404-end-of-project',
		listed: true,
	},
	{
		id: '1.7.02',
		label: '1.7.02',
		title: 'Public details of projects',
		topic: 'governance',
		type: 'feedback',
		status: 'agreed',
		statusText: 'Agreed (Meeting #5)',
		satre: ['1.7.02'],
		position:
			'Not specific to genomics. Whether project details are published should be the custodian’s decision, because some custodians cannot publish them, for example for Indigenous data. To be raised with SATRE as general feedback.',
		anchor: '1702-public-details-of-projects',
		listed: true,
	},

	// Pillar 2: Computing Technology and Information Security
	{
		id: '2.1.01',
		label: '2.1.01',
		title: 'System clipboard',
		topic: 'egress',
		type: 'note',
		status: 'open',
		statusText: 'Open (Meeting #6)',
		satre: ['2.1.01'],
		position:
			'The clipboard rule protects against copying small amounts of identifying text. The main genomics risk is bulk copying of large files, and browser-based platforms find the rule hard to enforce. A genomics TRE should base this control on a threat analysis.',
		anchor: '2101-system-clipboard',
		listed: true,
	},
	{
		id: '2.1.10',
		label: '2.1.10',
		title: 'Software that changes the infrastructure',
		topic: 'workflow',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #6), placement open',
		satre: ['2.1.10'],
		position:
			'Some genomics software changes the infrastructure the TRE must provide, such as workflow engines and Spark clusters for Hail. Researchers cannot reasonably set these up in a workspace, so the TRE must plan for them. Ordinary command-line tools need no special mention.',
		anchor: '2110-software-applications',
		listed: true,
	},
	{
		id: '2.1.12',
		label: '2.1.12',
		title: 'Container registries',
		topic: 'workflow',
		type: 'change',
		status: 'open',
		statusText: 'Open (Meeting #6)',
		satre: ['2.1.12'],
		position:
			'Proposed: raise to Recommended. Most pipelines pull a container for each task, and much genomics software comes from GitHub, Bioconda and container registries. The custodian should decide how open this access is.',
		anchor: '2112-software-repositories-and-container-registries',
		listed: true,
	},
	{
		id: '2.1.14',
		label: '2.1.14',
		title: 'Segregation at the workflow layer',
		topic: 'compute',
		type: 'note',
		status: 'open',
		statusText: 'Open (Meeting #6)',
		satre: ['2.1.14'],
		position:
			'Workflow engines create many short-lived compute nodes, so projects must also stay separate inside the engine. Each project’s logs, work directories and job lists must be visible only to that project.',
		anchor: '2114-segregation-on-all-compute',
		listed: true,
	},
	{
		id: '2.1.G1',
		label: '2.1.G1',
		title: 'Dynamic compute',
		topic: 'compute',
		type: 'new',
		status: 'open',
		statusText: 'Open (Meeting #7). Need and wording direction agreed, level open',
		capability: '2.1',
		related: ['2.1.15', '2.1.16'],
		position:
			'Researchers need easy access to many nodes, large-memory nodes or GPUs, created and removed as each pipeline stage needs them. The requirement should state the capability, give automatic scaling, clusters on demand and machines by the hour as examples, and require clean-up. The level could instead be set by raising 2.1.15 to Mandatory.',
		anchor: '21g1-dynamic-compute',
		listed: true,
	},
	{
		id: '2.1.G2',
		label: '2.1.G2',
		title: 'Shared reference data',
		topic: 'workflow',
		type: 'new',
		status: 'open',
		statusText: 'Open (Meeting #7). Need agreed, solution and level open',
		capability: '2.1',
		related: ['2.1.07', '2.2.11'],
		position:
			'A TRE blocks the downloads that pipelines use to fetch reference genomes and annotation databases, so it must offer another way. The options are a curated shared store, an allow-list of download sites, or researcher ingress. Each option needs someone to curate the sources.',
		anchor: '21g2-shared-reference-data',
		listed: true,
	},
	{
		id: '2.1.G3',
		label: '2.1.G3',
		title: 'Workflow engines',
		topic: 'workflow',
		type: 'new',
		status: 'open',
		statusText: 'Open (Meeting #6)',
		capability: '2.1',
		related: ['2.1.10', '2.1.11'],
		position:
			'The TRE provides a workflow engine, such as Nextflow, Cromwell for WDL or a CWL runner, so that projects do not each build and run their own. The engine must be kept current, because old versions cannot run newer community pipelines.',
		anchor: '21g3-workflow-engines',
		listed: true,
	},
	{
		id: '2.2.02',
		label: '2.2.02',
		title: 'Automated deployment',
		topic: 'compute',
		type: 'change',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.2.02'],
		position:
			'Proposed: raise to Mandatory. Workflow-driven compute is created and removed all the time, and custodians need deployments they can inspect. Infrastructure as code provides both.',
		anchor: '2202-automated-deployment',
		listed: true,
	},
	{
		id: '2.2.07',
		label: '2.2.07',
		title: 'Provider availability',
		topic: 'compute',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.2.07'],
		position:
			'Genomics jobs can run for hours or days, so what matters is that a running job completes. Understand provider guarantees in those terms, including how often spot capacity is interrupted.',
		anchor: '2207-provider-availability',
		listed: true,
	},
	{
		id: '2.2.08',
		label: '2.2.08',
		title: 'Availability statement',
		topic: 'compute',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.2.08'],
		position:
			'The statement should cover whether pipelines run to completion, whether datasets can be read when needed, including restores from archive, and how long a job waits before compute starts.',
		anchor: '2208-availability-statement',
		listed: true,
	},
	{
		id: '2.2.11',
		label: '2.2.11',
		title: 'Outbound connections',
		topic: 'workflow',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.2.11'],
		position:
			'Pipelines need containers, reference data and orchestration services from outside. A TRE can meet this with internal mirrors or an allow-list of endpoints, and should approve and record each exception.',
		anchor: '2211-outbound-connections',
		listed: true,
	},
	{
		id: '2.2.15',
		label: '2.2.15',
		title: 'Resource usage records',
		topic: 'cost',
		type: 'change',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.2.15'],
		position:
			'Proposed: raise to Mandatory. Record usage for each project, and for each pipeline run where possible, because costs per run can be large and hard to predict.',
		anchor: '2215-resource-usage',
		listed: true,
	},
	{
		id: '2.3.01',
		label: '2.3.01',
		title: 'Resources and costs before a project',
		topic: 'cost',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.3.01'],
		position:
			'Genomics resource needs are hard to state in advance. Describe on-demand capacity, quotas and burst limits, and explain the cost model, rather than offering a fixed allocation.',
		anchor: '2301-resources-and-costs-before-a-project',
		listed: true,
	},
	{
		id: '2.3.03',
		label: '2.3.03',
		title: 'Allocating resources',
		topic: 'compute',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.3.03'],
		position:
			'Allocation is dynamic. One researcher can start hundreds of nodes at once, so the procedure must cope with bursts and stop one project starving the others.',
		anchor: '2303-allocating-resources',
		listed: true,
	},
	{
		id: '2.3.04',
		label: '2.3.04',
		title: 'Overspending',
		topic: 'cost',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.3.04'],
		related: ['4.4.G1'],
		position:
			'SATRE’s guidance already suggests restricting consumption per project in cloud TREs. For how this works in genomics, see budget limits.',
		anchor: '2304-overspending',
		listed: true,
	},
	{
		id: '2.6.01',
		label: '2.6.01',
		title: 'Backups',
		topic: 'data',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['2.6.01'],
		position:
			'Decide what to back up by type of data. Researchers’ outputs are high priority, and reference data that can be fetched again is low priority. The custodian, not the TRE, should back up original participant data.',
		anchor: '2601-backups',
		listed: true,
	},

	// Pillar 3: Data Management
	{
		id: '3.1.03',
		label: '3.1.03',
		title: 'Classification',
		topic: 'data',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #7), wording to clarify',
		satre: ['3.1.03'],
		position:
			'Treat genomic data as highly sensitive by default. The custodian resolves differences in consent before release, so that a project receives only the participants and files it may use. For example, a multi-sample VCF is filtered or served through htsget.',
		anchor: '3103-classification',
		listed: true,
	},
	{
		id: '3.1.04',
		label: '3.1.04',
		title: 'Ingress at scale',
		topic: 'data',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #7)',
		satre: ['3.1.04'],
		position:
			'Ingress must handle objects of hundreds of gigabytes, datasets of many small objects, transfers that take days, and restores from archive. It needs long-running transfers, copying of selected objects, and integrity checks.',
		anchor: '3104-ingress',
		listed: true,
	},
	{
		id: '3.1.05',
		label: '3.1.05',
		title: 'Egress',
		topic: 'egress',
		type: 'note',
		status: 'agreed',
		statusText: 'Agreed (Meeting #7)',
		satre: ['3.1.05'],
		position:
			'Nobody can review BAM or CRAM files by eye, egress at scale can be costly, and access through APIs such as htsget must also be covered. The main threat is bulk exfiltration of individual-level files.',
		anchor: '3105-egress',
		listed: true,
	},
	{
		id: '3.1.09',
		label: '3.1.09',
		title: 'Deletion',
		topic: 'data',
		type: 'note',
		status: 'open',
		statusText: 'Open (Meeting #7)',
		satre: ['3.1.09'],
		position:
			'Deleting hundreds of terabytes takes time and money. A project starts and ends with no data, withdrawal takes effect at the next data release, and the policy must match what the technology can do. What tools a TRE needs to carry out the policy is still open.',
		anchor: '3109-deletion',
		listed: true,
	},
	{
		id: '3.1.13',
		label: '3.1.13',
		title: 'Data minimisation',
		topic: 'data',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['3.1.13'],
		position:
			'Do not copy large genomic datasets into each project. Instead, give projects read-only access to a single copy, API access, or copy-on-write storage.',
		anchor: '3113-data-minimisation',
		listed: true,
	},
	{
		id: '3.1.G1',
		label: '3.1.G1',
		title: 'Ingress from archive storage',
		topic: 'data',
		type: 'new',
		status: 'proposed',
		statusText: 'Proposed',
		capability: '3.1',
		related: ['3.1.04'],
		position:
			'Support ingress from archive storage tiers, with control over how fast data is restored and visibility of what the restore costs.',
		anchor: '31g1-ingress-from-archive-storage',
		listed: true,
	},
	{
		id: '3.1.G2',
		label: '3.1.G2',
		title: 'API access to genomic data',
		topic: 'data',
		type: 'new',
		status: 'proposed',
		statusText: 'Proposed',
		capability: '3.1',
		related: ['3.1.13'],
		position:
			'Support streaming access through APIs such as GA4GH htsget, so that an analysis fetches only the regions or samples it needs instead of whole files.',
		anchor: '31g2-api-access-to-genomic-data',
		listed: true,
	},
	{
		id: '3.2.03',
		label: '3.2.03',
		title: 'Access by data type and participant',
		topic: 'governance',
		type: 'change',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['3.2.03'],
		position:
			'The access model should support restrictions by data type and by participant subset, and time-limited access that expires automatically. Participant subsets may belong to cohort construction instead.',
		anchor: '3203-least-access',
		listed: true,
	},
	{
		id: '3.3.01',
		label: '3.3.01',
		title: 'Classifying outputs',
		topic: 'egress',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['3.3.01'],
		position:
			'Output classification needs genomics rules. Allele frequencies over many people are usually safe, while individual variant calls and statistics from small groups can be disclosive.',
		anchor: '3301-classifying-outputs',
		listed: true,
	},
	{
		id: '3.3.06',
		label: '3.3.06',
		title: 'Statistical basis for output checking',
		topic: 'egress',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['3.3.06'],
		position:
			'Standard disclosure rules, such as minimum cell counts, do not map onto genomic outputs, and the field has no agreed thresholds. Published rules, such as those of Our Future Health, are one example of current practice.',
		anchor: '3306-statistical-basis-for-output-checking',
		listed: true,
	},
	{
		id: '3.3.07',
		label: '3.3.07',
		title: 'Outputs that cannot be checked by hand',
		topic: 'egress',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['3.3.07'],
		position:
			'BAM, CRAM and VCF files cannot be checked by hand. The policy should say which output types are safe by design and which are sensitive by default.',
		anchor: '3307-outputs-that-cannot-be-checked-manually',
		listed: true,
	},
	{
		id: '3.3.08',
		label: '3.3.08',
		title: 'Semi-automated output checks',
		topic: 'egress',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['3.3.08'],
		position:
			'A register of approved pipelines with known output types could reduce how much checking each output needs. A person should still review the outputs.',
		anchor: '3308-semi-automated-output-checks',
		listed: true,
	},
	{
		id: '3.4.01',
		label: '3.4.01',
		title: 'Metadata catalogue',
		topic: 'data',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['3.4.01'],
		position:
			'A genomics catalogue should describe sample counts, data types, consent scope and access conditions. GA4GH Beacon can answer whether matching data exists without exposing records.',
		anchor: '3401-metadata-catalogue',
		listed: true,
	},

	// Pillar 4: Supporting Capabilities
	{
		id: '4.4',
		label: '4.4',
		title: 'Dynamic cost management',
		topic: 'cost',
		type: 'new',
		typeLabel: 'New (mini-spec)',
		status: 'agreed',
		statusText: 'Agreed (Meetings #5 and #7). Detail is draft',
		capability: '4.4',
		related: ['4.4.01', '4.4.02', '2.3.04'],
		position:
			'Genomics costs come in bursts and can reach thousands of dollars within days. The custodian, the operator and the project may each pay for different parts. Cost management will be written up as a separate section, led by cost transparency, with limits second.',
		anchor: '44-financial-management',
		listed: true,
	},
	{
		id: '4.4.01',
		label: '4.4.01',
		title: 'Cost estimates and monitoring',
		topic: 'cost',
		type: 'change',
		status: 'agreed',
		statusText: 'Agreed in principle (Meeting #5)',
		satre: ['4.4.01'],
		position:
			'Also give cost estimates, or estimating guidance, before a pipeline runs, and near real-time monitoring while it runs. Accurate estimates are hard, and it is open whether a disclaimer is enough or something like a credit system is needed.',
		anchor: '4401-awareness-of-costs',
		listed: true,
	},
	{
		id: '4.4.02',
		label: '4.4.02',
		title: 'Tracking costs',
		topic: 'cost',
		type: 'change',
		status: 'open',
		statusText: 'Open (Meeting #5)',
		satre: ['4.4.02'],
		position:
			'Proposed: raise to Mandatory, and track costs for each project and each pipeline run. Whether the operator, the custodian or the researcher controls the tracking is open.',
		anchor: '4402-tracking-costs',
		listed: true,
	},
	{
		id: '4.4.04',
		label: '4.4.04',
		title: 'Minimising cost',
		topic: 'cost',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['4.4.04'],
		position:
			'The main levers are spot capacity for stages that can restart, shutting down idle resources, storage tiering, sizing compute to each stage, and reusing cached results.',
		anchor: '4404-minimising-cost',
		listed: true,
	},
	{
		id: '4.4.G1',
		label: '4.4.G1',
		title: 'Budget limits',
		topic: 'cost',
		type: 'new',
		status: 'open',
		statusText: 'Open (Meetings #5 and #7). Level now Recommended',
		capability: '4.4',
		related: ['2.3.04'],
		position:
			'Set a limit for each project, alert as spending approaches it, and let the operator or custodian choose what happens at the limit. Members did not want a hard stop required, because stopping a long job near its end can waste more than it saves.',
		anchor: '44g1-budget-limits',
		listed: true,
	},
	{
		id: '4.4.G2',
		label: '4.4.G2',
		title: 'Payment models',
		topic: 'cost',
		type: 'new',
		status: 'open',
		statusText: 'Open (Meeting #5)',
		capability: '4.4',
		position:
			'Support more than one way to pay, such as the researcher’s or institution’s own cloud account, a pre-paid allocation, or invoicing and cost recovery.',
		anchor: '44g2-payment-models',
		listed: true,
	},
	{
		id: '4.4.G3',
		label: '4.4.G3',
		title: 'Who pays for what',
		topic: 'cost',
		type: 'new',
		status: 'open',
		statusText: 'Open (Meeting #5)',
		capability: '4.4',
		position:
			'Make clear who pays for each kind of cost, and be able to charge them separately. For example, the custodian might pay to store a dataset while the project pays for compute.',
		anchor: '44g3-who-pays-for-what',
		listed: true,
	},
	{
		id: '4.7.01',
		label: '4.7.01',
		title: 'User community',
		topic: 'general',
		type: 'note',
		status: 'proposed',
		statusText: 'Proposed',
		satre: ['4.7.01'],
		position:
			'Besides a feedback process, bioinformatics users expect an active community around shared infrastructure, with a forum and a chat channel.',
		anchor: '4701-stakeholder-feedback',
		listed: true,
	},

	// Draft changes that the group reviewed and decided against. The SATRE for
	// Genomics page lists these under "Reviewed without change", not in its
	// summary table.
	{
		id: 'nochange-1.3.05',
		label: '1.3.05',
		title: 'Risk appetite',
		topic: 'governance',
		type: 'unchanged',
		status: 'agreed',
		statusText: 'Agreed (Meeting #5): no change',
		satre: ['1.3.05'],
		related: ['general-expectations'],
		position:
			'An organisation that holds genomic data already reflects its risks in its risk appetite. The tension between researchers and custodians was recorded as a general note instead.',
		anchor: 'discussed-and-left-unchanged',
		listed: false,
	},
	{
		id: 'nochange-2.1.02',
		label: '2.1.02',
		title: 'Familiar environment',
		topic: 'general',
		type: 'unchanged',
		status: 'agreed',
		statusText: 'Agreed (Meeting #6): no change',
		satre: ['2.1.02'],
		position:
			'SATRE already asks for an environment that is familiar to users. Genomics users need nothing different in principle.',
		anchor: 'discussed-and-left-unchanged',
		listed: false,
	},
	{
		id: 'nochange-2.1.05',
		label: '2.1.05',
		title: 'Guidance on tools and data',
		topic: 'general',
		type: 'unchanged',
		status: 'agreed',
		statusText: 'Agreed (Meeting #6): no change',
		satre: ['2.1.05'],
		position: 'Every field needs documentation for its own tools, so genomics adds nothing specific.',
		anchor: 'discussed-and-left-unchanged',
		listed: false,
	},
	{
		id: 'nochange-2.1.07',
		label: '2.1.07',
		title: 'Shared services within a project',
		topic: 'workflow',
		type: 'unchanged',
		status: 'agreed',
		statusText: 'Agreed (Meeting #6): no change',
		satre: ['2.1.07'],
		related: ['2.1.G2'],
		position:
			'Optional is enough, because a researcher can work without shared services in their own project. Reference data shared across the whole TRE is a separate question.',
		anchor: 'discussed-and-left-unchanged',
		listed: false,
	},
	{
		id: 'nochange-2.1.09',
		label: '2.1.09',
		title: 'Software that needs telemetry',
		topic: 'workflow',
		type: 'unchanged',
		status: 'agreed',
		statusText: 'Agreed (Meeting #6): no change',
		satre: ['2.1.09'],
		position:
			'Some genomics software phones home for licensing. SATRE’s requirement to mitigate and record the risk already covers this, although exceptions are needed in practice.',
		anchor: 'discussed-and-left-unchanged',
		listed: false,
	},
	{
		id: 'nochange-2.1.11',
		label: '2.1.11',
		title: 'Tools for reproducible analysis',
		topic: 'workflow',
		type: 'unchanged',
		status: 'agreed',
		statusText: 'Agreed (Meeting #6): no change',
		satre: ['2.1.11'],
		related: ['2.1.G3'],
		position:
			'Workflow engines are part of doing genomics at all, not just good practice, so the need belongs in its own requirement.',
		anchor: 'discussed-and-left-unchanged',
		listed: false,
	},
	{
		id: 'rejected-1.3-risk',
		label: '1.3 (new)',
		title: 'Risk assessment for genomic data',
		topic: 'governance',
		type: 'unchanged',
		status: 'agreed',
		statusText: 'Rejected (Meeting #5)',
		related: ['1.3.02'],
		position: 'A proposed new requirement, deleted because it repeated the note on 1.3.02.',
		anchor: 'rejected-proposals',
		listed: false,
	},
	{
		id: 'rejected-1.4-withdrawal',
		label: '1.4 (new)',
		title: 'Technical enforcement of consent withdrawal',
		topic: 'governance',
		type: 'unchanged',
		status: 'agreed',
		statusText: 'Rejected (Meeting #5)',
		related: ['1.4.01'],
		position:
			'A proposed new requirement, rejected as out of scope for a TRE. Cohort construction decides what a project may use, and withdrawal usually takes effect at the next data release.',
		anchor: 'rejected-proposals',
		listed: false,
	},
];

export function typeLabel(entry: GenomicsEntry): string {
	return entry.typeLabel ?? TYPES.find((t) => t.id === entry.type)!.label;
}

export function statusLabel(status: EntryStatus): string {
	return STATUSES.find((s) => s.id === status)!.label;
}

export function typeMeaning(type: EntryType): string {
	return TYPES.find((t) => t.id === type)!.meaning;
}

export function statusMeaning(status: EntryStatus): string {
	return STATUSES.find((s) => s.id === status)!.meaning;
}

export function topicLabel(topic: Topic): string {
	return TOPICS.find((t) => t.id === topic)!.label;
}

/** Link to the full entry on the SATRE for Genomics page. */
export function fullEntryHref(entry: GenomicsEntry): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	return `${base}/requirements/satre-genomics/#${entry.anchor}`;
}

/**
 * Link to the summary table on the SATRE for Genomics page. If a topic or a
 * status is given, the table opens filtered to it. The table reads the
 * filter from the address, so the names here must match what
 * SatreGenomicsSummary.astro looks for.
 */
export function summaryHref(filter: { topic?: Topic; status?: EntryStatus } = {}): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const query = new URLSearchParams(filter).toString();
	return `${base}/requirements/satre-genomics/${query ? `?${query}` : ''}#summary`;
}

// Check the data when the site builds, so that a typo in an ID fails the
// build instead of producing a square or link that points nowhere.
(function validate() {
	const ids = new Set<string>();
	const claimed = new Map<string, string>();
	for (const e of genomicsEntries) {
		if (ids.has(e.id)) throw new Error(`Duplicate genomics entry id: ${e.id}`);
		ids.add(e.id);
		for (const s of e.satre ?? []) {
			if (!satreById.has(s)) throw new Error(`Entry ${e.id} refers to unknown SATRE line ${s}`);
			// Each SATRE line has one square on the map, so only one entry can
			// colour it.
			if (claimed.has(s)) throw new Error(`SATRE ${s} is claimed by both ${claimed.get(s)} and ${e.id}`);
			claimed.set(s, e.id);
		}
		if (e.capability && ![...satreById.values()].some((r) => r.capabilityIndex === e.capability)) {
			throw new Error(`Entry ${e.id} refers to unknown SATRE capability ${e.capability}`);
		}
	}
	for (const e of genomicsEntries) {
		for (const r of e.related ?? []) {
			if (!satreById.has(r) && !ids.has(r)) throw new Error(`Entry ${e.id} has unknown related id ${r}`);
		}
	}
})();

# SATRE data

This folder holds the data behind the SATRE map and the lists of entries in the report
[What makes a genomics TRE different](../../content/docs/reports/genomics-tre.mdx),
and the summary table on the [SATRE for Genomics](../../content/docs/requirements/satre-genomics.mdx) page.

| File | What it is |
|---|---|
| `specification-v2.0.1.yaml` | The SATRE specification, copied unchanged from `docs/source/spec/specification.yaml` at tag `v2.0.1` of [sa-tre/satre-specification](https://github.com/sa-tre/satre-specification). |
| `satre.ts` | Parses the YAML at build time into pillars, capabilities and requirements. |
| `genomics-entries.ts` | The working group's genomics position on each SATRE line: type, status, topic and a short summary. |
| `genomics-views.ts` | Groups those entries by SATRE capability and by topic, and counts them, for the components that show them. |

## Licence

The SATRE specification is published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
The site credits it and links to the published version wherever it quotes SATRE.

## Updating the SATRE specification

1. Download the YAML for the new tag:

   ```bash
   node scripts/satre/fetch-specification.mjs v2.1.0
   ```

   The script writes `specification-v2.1.0.yaml` and prints its checksum.
2. Compare the new file with the old one, and check whether any requirement that `genomics-entries.ts` refers to has changed or moved.
3. Change the import, `SATRE_VERSION` and `SATRE_SPEC_URL` in `satre.ts`.
4. Run `bun run build`. The build fails if an entry refers to a SATRE ID that no longer exists.

## Updating the genomics entries

The full text of each entry lives in `src/content/docs/requirements/satre-genomics.mdx`.
When an entry's type or status changes there, change `genomics-entries.ts` to match.
The SATRE for Genomics summary table, the map and the lists in the report all update from it.

## Where the data is shown

The components are in `src/components/satre-genomics/`.

| Component | Page | What it shows |
|---|---|---|
| `SatreMap.astro` | Report | One square for each SATRE requirement. The capabilities with no genomics difference share one row for each pillar. Selecting a capability lists its entries, with the short summary of each. |
| `TopicEntries.astro` | Report | The entries for one topic, at the end of that topic's section. Each row links to the full entry. |
| `TopicStatusTable.astro` | Report | Counts by topic and status. Each number links to the summary table, already filtered. |
| `SatreGenomicsSummary.astro` | SATRE for Genomics | Every entry in one table that can be searched and filtered. Each row links to the full entry on the same page. |

Only the map shows the short summary (`position`) of an entry. Every other place links to the full text.

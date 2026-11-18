# SATRE data

This folder has the code behind the SATRE map and the lists of entries in the report
[What makes a genomics TRE different](../../content/docs/reports/genomics-tre.mdx),
and the summary list on the [SATRE for Genomics](../../content/docs/requirements/satre-genomics.mdx) page.

| File | What it is |
|---|---|
| `specification-v2.0.1.yaml` | The SATRE specification, copied unchanged from `docs/source/spec/specification.yaml` at tag `v2.0.1` of [sa-tre/satre-specification](https://github.com/sa-tre/satre-specification). |
| `satre.ts` | Parses the YAML at build time into pillars, capabilities and requirements. |
| `genomics-entries.ts` | Reads the working group's genomics entries from the `<Entry>` tags on the SATRE for Genomics page. |
| `genomics-views.ts` | Groups those entries by SATRE capability and by topic, and counts them, for the components that show them. |

## Updating the SATRE specification

1. Download the YAML for the new tag:

   ```bash
   node scripts/satre/fetch-specification.mjs v2.1.0
   ```

   The script writes `specification-v2.1.0.yaml` and prints its checksum.
2. Compare the new file with the old one, and check whether any requirement that an entry on the SATRE for Genomics page is about has changed or moved.
3. Change the import, `SATRE_VERSION` and `SATRE_SPEC_URL` in `satre.ts`.
4. Run `bun run build`. The build fails if an entry refers to a SATRE ID that no longer exists.

## The genomics entries

Each entry is an `<Entry>` tag in `src/content/docs/requirements/satre-genomics.mdx`, followed by the discussion of the entry:

```mdx
<Entry id="1.4.01" title="Per-participant consent" heading="Legal, financial and ethical checks"
  topic="governance" type="note" status="agreed"
  statusText="Agreed (Meeting #5) as a strong note." />

Consent in genomics often differs between participants.
```

On the page it writes the heading of the entry, its type and status, and the SATRE requirement that it is about.
`genomics-entries.ts` reads the tags from the source of the page for the summary list, the map and the lists in the report.

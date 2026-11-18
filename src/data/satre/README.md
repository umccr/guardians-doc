# SATRE data

This folder has the code behind the SATRE map and the lists of entries in the report
[What makes a genomics TRE different](../../content/docs/reports/genomics-tre.mdx),
and the summary list on the [SATRE for Genomics](../../content/docs/requirements/satre-genomics.mdx) page.

| File | What it is |
|---|---|
| `satre.ts` | Downloads the SATRE specification YAML for `SATRE_VERSION` from [sa-tre/satre-specification](https://github.com/sa-tre/satre-specification) when the site builds, and parses it into a list of requirements. |
| `genomics-entries.ts` | Reads the working group's genomics entries from the `<Entry>` tags on the SATRE for Genomics page. |
| `genomics-views.ts` | Groups the SATRE requirements and those entries by pillar and capability, and counts the entries by status, for the components that show them. |

## Updating the SATRE specification

Every build, and the dev server, downloads the specification, so they need access to `raw.githubusercontent.com`.

1. Compare the two releases on GitHub, at `https://github.com/sa-tre/satre-specification/compare/v2.0.1...<new tag>`,
   and check whether any requirement that an entry on the SATRE for Genomics page is about has changed or moved.
2. Change `SATRE_VERSION` in `satre.ts`.
3. Run `bun run build`.

## The genomics entries

Each entry is an `<Entry>` tag in `src/content/docs/requirements/satre-genomics.mdx`, followed by the discussion of the entry:

```mdx
<Entry id="1.4.01" title="Per-participant consent" heading="Legal, financial and ethical checks"
  topic="Governance and consent" type="note" status="agreed"
  statusText="Agreed (Meeting #5) as a strong note." />

Consent in genomics often differs between participants.
```

On the page it writes the heading of the entry, its type and status, and the SATRE requirement that it is about.
`genomics-entries.ts` reads the tags from the source of the page for the summary list, the map and the lists in the report.

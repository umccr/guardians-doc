# GUARDIANS documents for CCGCM

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

## 🚀 Project Structure

Inside of your Astro + Starlight project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
|:--------------------------| :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build your production site to `./dist/`          |
| `bun run preview`         | Preview your build locally, before deploying     |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun run astro -- --help` | Get help using the Astro CLI                     |

## 💲 Costing report ("Costing a data-sharing platform")

Notes for maintainers. Everything lives under the `costing-data-sharing` name:

| What | Where |
|:-----|:------|
| Pages | `src/content/docs/reports/costing-data-sharing-platform/` (`costing-scrollytell.mdx`, `standing-costs.mdx`, `storage.mdx`, `data-movement-egress.mdx`) |
| Components | `src/components/costing-data-sharing/` (`CostTable`, `CostPieCharts`, `ReportScrolly`, `ReportStickyHeader`) |
| Data and plot script | `scripts/costing-data-sharing/` (`cost_tables.csv`, `gen_costing_svgs.py`) |
| Generated plots | `public/plots/costing-data-sharing/` |

### The CSV is the single source of truth

[`scripts/costing-data-sharing/cost_tables.csv`](scripts/costing-data-sharing/cost_tables.csv) holds every costing number that is shown as a table or plot. Edit the numbers there, never in the consumers.

Columns: `table, group, row, link, column, min, max, total`. The `table` column says which table a line belongs to:

| `table` | Content | Read by |
|:--------|:--------|:--------|
| `standing`, `storage`, `data-movement` | Component cost ranges (min-max) per platform; rows with `total=1` are the published totals | `CostTable`, `CostPieCharts` (component rows, midpoints), scene bar plots (total rows, midpoints), "Typical cost" lines in `ReportScrolly` (total rows) |
| `lifecycle-series` | Yearly monthly cost per strategy, platform and component (Year 1-7) | Lifecycle plots (script) and the lifecycle table (`CostTable` derives Year 1/3/7 and the 7-year total from it) |

Totals are stored as published values, not computed from the components (the standing ISP maxima sum to $1,150 but the published total is $1,250).

### Updating the numbers

1. Edit `cost_tables.csv`.
2. Regenerate the plots (needs `numpy` and `matplotlib`):
   ```bash
   python scripts/costing-data-sharing/gen_costing_svgs.py
   ```
   It rewrites everything in `public/plots/costing-data-sharing/`. The three scene SVGs and the lifecycle plots change with the CSV. Regenerating also rewrites SVG metadata (dates, IDs) in the unused variants, so review the diff and keep only the files that really changed.
3. Tables, pie charts and "Typical cost" lines update on the next `bun run build` / `dev`.

### Still hardcoded (update by hand)

These values do not read from the CSV. If you change the CSV, check them:

- The "Typical monthly cost: **$X-Y**" lines in `storage.mdx` (8) and `data-movement-egress.mdx` (8): one per component and platform.
- The AWS line-item estimates in `standing-costs.mdx` (for example "1 NAT Gateway - around $40/month").
- The per-GB unit prices in `data-movement-egress.mdx` (cross-region, internet egress).
- Any prose in the pages that quotes totals or ranges.

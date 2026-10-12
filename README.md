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
| Data and plot scripts | `scripts/costing-data-sharing/` (`calculate_cost.py`, `cost_table.csv`, `gen_costing_svgs.py`) |
| Generated plots | `public/plots/costing-data-sharing/` |

### The CSV is the single source of truth

[`scripts/costing-data-sharing/calculate_cost.py`](scripts/costing-data-sharing/calculate_cost.py) calculates the estimates and writes [`cost_table.csv`](scripts/costing-data-sharing/cost_table.csv). This generated CSV is the single source of truth consumed by the report tables and plots; update the model inputs and assumptions in the calculator rather than editing the CSV or its consumers.

Columns: `table, group, row, link, column, value, total`. Each `value` is a calculated estimate:

| `table` | Content | Read by |
|:--------|:--------|:--------|
| `standing`, `storage`, `data-movement` | Component cost estimates per platform; rows with `total=1` are calculated totals | `CostTable`, `CostPieCharts`, scene bar plots, and "Typical cost" lines in `ReportScrolly` |
| `lifecycle-series` | Annual spend per strategy, platform and component (Year 1-7) | Lifecycle plots and the lifecycle table (`CostTable` derives annual spend for Years 1/3/7 and the seven-year total) |

Values are stored at calculation precision; report tables round them and prefix them with `~` to indicate estimates.

### Updating the numbers

1. Run the calculator to regenerate `cost_table.csv`:
   ```bash
   python scripts/costing-data-sharing/calculate_cost.py
   ```
2. Regenerate the plots (needs `numpy` and `matplotlib`):
   ```bash
   python scripts/costing-data-sharing/gen_costing_svgs.py
   ```
   It rewrites everything in `public/plots/costing-data-sharing/`. The three scene SVGs and the lifecycle plots change with the CSV. Regenerating also rewrites SVG metadata (dates, IDs) in the unused variants, so review the diff and keep only the files that really changed.
3. Tables, pie charts and "Typical cost" lines update on the next `bun run build` / `dev`.

### Still hardcoded (update by hand)

These values are prose rather than generated from the CSV. If you change the calculator, check them:

- The "Typical monthly cost" lines in `storage.mdx` and `data-movement-egress.mdx`: one per component and platform.
- The AWS line-item estimates in `standing-costs.mdx` (for example "1 NAT Gateway - around $40/month").
- The per-GB unit prices in `data-movement-egress.mdx` (cross-region, internet egress).
- Any prose in the pages that quotes totals or ranges.

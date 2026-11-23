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

| What | Where |
|:-----|:------|
| Pages | `src/content/docs/reports/costing-data-sharing-platform/` |
| Components | `src/components/costing-data-sharing/` |
| Calculator, data and plot script | `scripts/costing-data-sharing/` (`calculate_cost.py`, `cost_table.csv`, `gen_costing_svgs.py`) |
| Generated plots | `public/plots/costing-data-sharing/` |

[`calculate_cost.py`](scripts/costing-data-sharing/calculate_cost.py) is the single source of truth. It holds the dated AWS prices and the modelled assumptions, and writes [`cost_table.csv`](scripts/costing-data-sharing/cost_table.csv) (`table, group, row, link, column, value, total`). The report tables, pie charts, "Typical cost" lines and plots all read that CSV, so change the calculator rather than the CSV or its consumers. Report tables round values and prefix them with `~`.

### Updating the numbers

```bash
python scripts/costing-data-sharing/calculate_cost.py   # regenerate cost_table.csv
python scripts/costing-data-sharing/gen_costing_svgs.py # regenerate plots (needs numpy, matplotlib)
```

Tables and "Typical cost" lines update on the next `bun run build` / `dev`. The plot script rewrites every SVG in `public/plots/costing-data-sharing/`, including SVG metadata (dates, IDs) in unused variants, so review the diff and keep only files that really changed.

### Not generated from the calculator

The assumptions written in the `.mdx` pages (quantities, request volumes, transfer sizes) and the general per-GB reference prices in `data-movement-egress.mdx` are prose.
## 🏛️ Architecture diagrams (LikeC4)

| What | Where |
|:-----|:------|
| C4 model (LikeC4 DSL) | `not-for-publishing/architecture/*.likec4` |
| Vite plugin config | `astro.config.mjs` (`LikeC4VitePlugin({ workspace: ... })`) |
| Components | `src/components/LikeC4Diagram.astro`, `src/components/LikeC4ViewReact.tsx` |

Every `.likec4` file in the workspace folder (and its sub-folders) is merged into one model, so split specs, model and views across files freely. View IDs must be unique across the whole workspace. Diagrams are laid out and rendered at build time by the Vite plugin, so there is no separate render step; edits to `.likec4` files reload live in `bun run dev` (restart if you change the workspace path).

```mdx
import LikeC4Diagram from '../../../components/LikeC4Diagram.astro';

<LikeC4Diagram viewId="landscape" caption="Optional caption" />
```

Clicking a diagram opens it full-screen. Check the model with `bunx likec4 validate not-for-publishing/architecture`, or edit it interactively with `bunx likec4 start not-for-publishing/architecture`.

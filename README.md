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
## 🏛️ Architecture diagrams (Structurizr)

| What | Where |
|:-----|:------|
| C4 model (Structurizr DSL) | `not-for-publishing/architecture/*.dsl` |
| Render script | `scripts/architecture/render.sh` (`bun run diagrams`) |
| Generated SVGs (git-ignored) | `public/diagrams/architecture/<view-key>.svg` (+ `<view-key>-key.svg` legend) |
| Component | `src/components/StructurizrDiagram.astro` |

Each top-level `.dsl` file is a workspace and each view in it becomes an SVG named after the view key, so give every view an explicit, stable key. Put files pulled in with `!include` in a sub-folder so they aren't rendered as workspaces.

```bash
bun run diagrams   # needs Docker; uses the structurizr/structurizr Playwright image
```

```mdx
import StructurizrDiagram from '../../../components/StructurizrDiagram.astro';

<StructurizrDiagram view="gdn-context" legend caption="Optional caption" />
```

The SVGs are git-ignored and rebuilt by the GitHub Pages workflow on every publish, so run the script locally before `bun run dev` to see them. To edit a diagram interactively, run `docker run -it --rm -p 8080:8080 -v "$PWD/not-for-publishing/architecture:/usr/local/structurizr" structurizr/structurizr:2026.10.26-playwright local` and open http://localhost:8080.

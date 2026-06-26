# Project Guidance

This file provides guidance when working with code in this repository.

## Commands

```bash
bun install        # Install dependencies
bun run dev        # Start local dev server at localhost:4321
bun run build      # Build production site to ./dist/
bun run preview    # Preview production build locally
```

## Architecture

This is an **Astro + Starlight** documentation site for UMCCR GUARDIANS.
It deploys to GitHub Pages at `https://umccr.github.io/guardians-doc`.

### Content

All documentation lives in `src/content/docs/` as `.md` or `.mdx` files. The sidebar is manually defined in `astro.config.mjs` with explicit item paths. Content is organized into these directories:
- `genomic-data-nodes/` — Architecture and work packages
- `technology/` — Technology-specific pages (AAF, Seqera, Globus, etc.)
- `guides/` — How-to guides
- `requirements/` — Requirement specs
- `other-work/` — Additional work items

Routes are derived directly from filenames.

### Diagramming

Two diagramming systems are in use:

1. **draw.io SVGs** — Stored in `public/diagrams/` as `.drawio.svg` files (SVGs with embedded mxfile XML).
  The `DrawioDiagram` component (`src/components/DrawioDiagram.astro`) renders them
  with **build-time layer filtering** — no client JS. Use `showLayers` or `hideLayers` props
  to control which draw.io layers are visible. `ArchitectureFloat.astro` is a convenience wrapper
  for the main `guardians-overall.drawio.svg` diagram.

2. **D2 diagrams** — Via the `astro-d2` integration. D2 code blocks in `.mdx` files are rendered to SVGs at
  build time (output cached in `public/d2/`).

### Styling

Tailwind CSS v4 is used via `@tailwindcss/vite`. Starlight-Tailwind integration bridges Starlight's design tokens with Tailwind. CSS entrypoints:
- `src/styles/global.css` — layer imports for Starlight + Tailwind
- `src/styles/custom.css` — project-specific overrides

### Key integration details

- `astro.config.mjs` — Starlight config, sidebar structure, d2 integration, Tailwind vite plugin
- `src/content.config.ts` — Starlight docs collection schema (standard, no customization)
- `not-for-publishing/` — Design assets (Affinity Designer files, SVGs) not included in the built site

### Sample projects

There are some example projects in `example-projects/` that are included as source by reference in the docs. These are fully functional/runnable codebases.

- `seqera-aws-terraform/` — Terraform project that deploys a Seqera cluster on AWS
- `aai-aaf-python/` — Python Flask app demonstrating AAF/OIDC authentication
- `aai-aaf-ts/` — TypeScript/Express app demonstrating AAF/OIDC authentication

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start local dev server at localhost:4321
npm run build      # Build production site to ./dist/
npm run preview    # Preview production build locally
```

## Architecture

This is an **Astro + Starlight** documentation site for UMCCR GUARDIANS.
It deploys to GitHub Pages at `https://umccr.github.io/guardians-docs`.

### Content

All documentation lives in `src/content/docs/` as `.md` or `.mdx` files. The sidebar is auto-generated from four directories:
- `genomic-nodes/` — Vision, architecture, and work packages
- `technology/` — Technology-specific pages (AAF, Seqera, Globus, etc.)
- `guides/` — How-to guides
- `requirements/` — Requirement specs

Routes are derived directly from filenames. Numeric prefixes (e.g. `01-vision.md`) control ordering in the sidebar.

### Diagramming

Two diagramming systems are in use:

1. **draw.io SVGs** — Stored in `public/diagrams/` as `.drawio.svg` files (SVGs with embedded mxfile XML). The `DrawioDiagram` component (`src/components/DrawioDiagram.astro`) renders them with **build-time layer filtering** — no client JS. Use `showLayers` or `hideLayers` props to control which draw.io layers are visible. `ArchitectureFloat.astro` is a convenience wrapper for the main `guardians-overall.drawio.svg` diagram.

2. **D2 diagrams** — Via the `astro-d2` integration. D2 code blocks in `.mdx` files are rendered to SVGs at build time (output cached in `public/d2/`).

### Styling

Tailwind CSS v4 is used via `@tailwindcss/vite`. Starlight-Tailwind integration bridges Starlight's design tokens with Tailwind. CSS entrypoints:
- `src/styles/global.css` — layer imports for Starlight + Tailwind
- `src/styles/custom.css` — project-specific overrides

### Key integration details

- `astro.config.mjs` — Starlight config, sidebar structure, d2 integration, Tailwind vite plugin
- `src/content.config.ts` — Starlight docs collection schema (standard, no customization)
- `not-for-publishing/` — Design assets (Affinity Designer files, SVGs) not included in the built site

### Sample projects

There are some example projects in 'example-projects' that are included as source by reference in the docs. The
idea is that these example projects are fully functional/runnable codebases.

- `seqera-aws-terraform/` holds a Terraform project that deploys a Seqera cluster on AWS

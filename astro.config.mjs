// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Workaround for Vite 8/Rolldown issue with CSS ?url imports.
// Starlight's Page.astro imports print.css?url&no-inline which triggers a
// broken code path in Rolldown's CSS URL asset handling.
function starlightPrintCssWorkaround() {
    const printCssPath = resolve(__dirname, 'node_modules/@astrojs/starlight/style/print.css');
    let base = '/';
    let isBuild = false;

    return /** @type {import('vite').Plugin} */ ({
        name: 'starlight-print-css-workaround',
        enforce: 'pre',
        config(_, env) {
            isBuild = env.command === 'build';
        },
        configResolved(config) {
            base = config.base || '/';
        },
        resolveId(source) {
            if (source.endsWith('style/print.css?url&no-inline')) {
                if (!isBuild) {
                    // In dev, let Vite serve the file normally with just ?url
                    return printCssPath + '?url';
                }
                return '\0virtual:starlight-print-css';
            }
        },
        load(id) {
            if (id === '\0virtual:starlight-print-css') {
                // Export the base-prefixed URL that the asset will live at
                const assetUrl = base.endsWith('/') ? `${base}_astro/print.css` : `${base}/_astro/print.css`;
                return `export default ${JSON.stringify(assetUrl)};`;
            }
        },
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: '_astro/print.css',
                source: readFileSync(printCssPath, 'utf-8'),
            });
        }
    });
}

// https://astro.build/config
export default defineConfig({
    site: 'https://umccr.github.io',
    base: '/guardians-doc',

    integrations: [starlight({
        title: 'GUARDIANS (CCGCM)',
        customCss: [
            './src/styles/global.css',
            './src/styles/custom.css',
        ],
        tableOfContents: false,
        components: {
            ThemeSelect: './src/components/ThemeSelect.astro',
            ThemeProvider: './src/components/ThemeProvider.astro',
        },
        sidebar: [
            {
                label: 'Requirements',
                items: [
                    "requirements/overall",
                    "requirements/dataset-formatting",
                    "requirements/data-copying",
                    "requirements/data-release",
                    "requirements/data-control",
                    "requirements/researcher-environments-raw",
                    "requirements/researcher-environments"
                ]
            },
            {
                label: 'Solution Architecture',
                items: [
                    "solution-architecture/dataset-formatting",
                ]
            },
            {
                label: 'Genomic Data Nodes',
                items: [
                    // "genomic-data-nodes/vision",
                    "genomic-data-nodes/architecture",
                    "genomic-data-nodes/work-packages",
                ]
            },
            {
                label: 'Technology',
                items: [
                    {
                        label: 'Data Copying',
                        items: [
                            "technology/copyrite",
                            "technology/steps-s3-copy",
                            "technology/globus",
                        ]
                    },
                    {
                        label: "Cost Monitor",
                        items: [
                            "technology/curtrail",
                            "technology/steps-s3-copy-costing",
                        ]
                    },
                    {
                        label: "Data Sharing",
                        items: [
                            "technology/htsget-rs",
                        ]
                    },
                    {
                        label: "Support",
                        items: [
                            "technology/aaf",
                            "technology/rems-terraform-provider",
                        ]
                    },
                ]
            },
            {
                label: 'Guides',
                items: [
                    "guides/seqera-setup",
                    "guides/using-aaf-with-oidc",
                    "guides/aws-native-data-sharing",
                ]
            },
            {
                label: 'Reports',
                items: [
                    "reports/costing-data-sharing-platform/overview",
                ],
            }
        ],
    })],
    vite: {
        plugins: [/** @type {any} */ (tailwindcss()), starlightPrintCssWorkaround()],
    },
});

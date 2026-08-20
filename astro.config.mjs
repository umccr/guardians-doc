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
                label: 'Introduction',
                items: [
                    "introduction/stories",
                    "introduction/funding",
                ]
            },
            {
                label: 'Requirements',
                items: [
                    "requirements/overall",
                    "requirements/dataset-formatting",
                    "requirements/data-copying",
                    "requirements/data-release",
                    "requirements/data-control",
                    {
                        label: 'SATRE vs Genomics',
                        items: [
                            "requirements/satre/introduction",
                            "requirements/satre/1-1-information-governance",
                            "requirements/satre/1-2-quality-management",
                            "requirements/satre/1-3-risk-management",
                            "requirements/satre/1-4-study-management",
                            "requirements/satre/1-5-researcher-accreditation",
                            "requirements/satre/1-6-training-management",
                            "requirements/satre/1-7-public-involvement",
                            "requirements/satre/2-1-end-user-computing",
                            "requirements/satre/2-2-infrastructure-management",
                            "requirements/satre/2-3-capacity-management",
                            "requirements/satre/2-4-configuration-management",
                            "requirements/satre/2-5-information-security",
                            "requirements/satre/2-6-cyber-resilience",
                            "requirements/satre/2-7-vulnerability-management",
                            "requirements/satre/2-8-encryption",
                            "requirements/satre/2-9-physical-security",
                            "requirements/satre/3-1-data-lifecycle-management",
                            "requirements/satre/3-2-identity-access-management",
                            "requirements/satre/3-3-output-management",
                            "requirements/satre/3-4-information-search-discovery",
                            "requirements/satre/4-1-business-continuity",
                            "requirements/satre/4-2-project-programme-management",
                            "requirements/satre/4-3-knowledge-management",
                            "requirements/satre/4-4-financial-management",
                            "requirements/satre/4-5-procurement",
                            "requirements/satre/4-6-it-service-management",
                            "requirements/satre/4-7-relationship-management",
                            "requirements/satre/4-8-legal-services",
                        ]
                    },
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
                    "genomic-data-nodes/legal-trust-concepts"
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
                label: 'Appendix',
                items: [
                    "requirements/researcher-environments-raw",
                ]
            }


        ],
    })],
    vite: {
        plugins: [/** @type {any} */ (tailwindcss()), starlightPrintCssWorkaround()],
    },
});

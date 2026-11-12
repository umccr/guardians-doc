// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwindcss from '@tailwindcss/vite';

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
                label: 'Stories',
                items: [
                    "stories/introduction",
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
                    "guides/apply-and-use-cup-data",
                ]
            },
            {
            label: 'Reports',
            items: [
                "reports/costing-data-sharing-platform/costing-scrollytell",
                "reports/sustainability/sustainability-report",
                "reports/seqera-ux-report",
            ],
            },
        ],
    })],
    vite: {
        plugins: [/** @type {any} */ (tailwindcss())],
    },
});

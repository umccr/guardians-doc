// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';
import { LikeC4VitePlugin } from 'likec4/vite-plugin';

// https://astro.build/config
export default defineConfig({
    site: 'https://umccr.github.io',
    base: '/guardians-doc',

    integrations: [react(), starlight({
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
                    "requirements/overview",
                    "requirements/roles",
                    "requirements/glossary",
                    "requirements/satre-genomics",
                    "requirements/dataset-formatting",
                    "requirements/data-copying"
                ]
            },
            {
                label: 'Solution Architecture',
                items: [
                    "solution-architecture/0-overview",
                    "solution-architecture/1-landscape-and-scope",
                    "solution-architecture/2-system-context",
                    "solution-architecture/3-building-blocks",
                    "solution-architecture/4-runtime-scenarios",
                    "solution-architecture/5-deployment",
                    // "solution-architecture/6-data-architecture", // hidden from sidebar for now (page still builds)
                    "solution-architecture/7-security",
                    // "solution-architecture/8-operations", // hidden from sidebar for now (page still builds)
                    // "solution-architecture/9-risks-and-technical-debt", // hidden from sidebar for now (page still builds)
                    {
                        label: 'Detailed Designs',
                        items: [
                            "solution-architecture/dataset-formatting",
                        ]
                    },
                ]
            },
            {
                label: 'Technology',
                items: [
                    "technology/work-packages",
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
                            "technology/data-releaser",
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
                "reports/genomics-tre",
            ],
            },
        ],
    })],
    vite: {
        plugins: [
            /** @type {any} */ (tailwindcss()),
            LikeC4VitePlugin({ workspace: './not-for-publishing/architecture' })
        ],
    },
});

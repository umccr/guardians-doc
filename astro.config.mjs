// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

import d2 from 'astro-d2';

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
        sidebar: [
            {
                label: 'Requirements',
                items: [
                    "requirements/infrastructure",
                    "requirements/data-copying",
                    "requirements/dataset-formatting",
                    "requirements/researcher-environments"
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
                            "technology/steps-s3-copy",
                        ]
                    },
                    {
                        label: "Data Sharing",
                        items: [
                            "technology/htsget-rs",
                        ]
                    },
                    {
                        label: "Helper",
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
            }


        ],
    }), d2(), mdx()],
    markdown: {
        gfm: true,
    },
    vite: {
        plugins: [tailwindcss()],
    },
});

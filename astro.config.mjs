// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';

import d2 from 'astro-d2';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: 'https://umccr.github.io',
    base: '/guardians-doc',

    integrations: [starlight({
        title: 'UMCCR Guardians',
        customCss: [
            './src/styles/global.css',
            './src/styles/custom.css',
        ],
        tableOfContents: false,
        sidebar: [
            {
                label: 'Genomic Nodes',
                items: [
                    "genomic-nodes/vision",
                    "genomic-nodes/architecture",
                    "genomic-nodes/work-packages",
                ]
            },
            {
                label: 'Technology',
                items: [
                    {
                        label: 'Data Copy',
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
                    "technology/aaf",
                    "technology/rems-terraform",
                    "technology/seqera-setup",
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
                label: 'Requirements',
                items: [
                    "requirements/data-copying",
                    "requirements/dataset-formatting",
                    "requirements/researcher-environments"
                ]
            }


        ],
    }), d2()],

    vite: {
        plugins: [tailwindcss()],
    },
});

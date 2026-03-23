// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	vite: {
		assetsInclude: ['**/*.drawio.svg'],
	},
	site: 'https://umccr.github.io',
	base: '/guardians-docs',
	integrations: [
		starlight({
			title: 'UMCCR Guardians',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/umccr/starlight' }],
			customCss: [
				'./src/styles/custom.css',
			],
			tableOfContents: false,
			sidebar: [
				{
					label: 'Genomic Nodes',
					autogenerate: { directory: 'genomic-nodes',  },
					//items: [
						// Each item here is one entry in the navigation menu.
				//		{ label: 'Example Guide', slug: 'guides/example' },
			//		],

				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});

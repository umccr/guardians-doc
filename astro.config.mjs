// @ts-check
import { defineConfig } from 'astro/config';
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
              autogenerate: {directory: 'genomic-nodes'}
          },
          {
              label: 'Technology',
              autogenerate: {directory: 'technology'}
          },
          {
              label: 'Guides',
              autogenerate: {directory: 'guides'}
          },
          {
              label: 'Requirements',
              autogenerate: {directory: 'requirements'}
          }


      ],
      }), d2()],

  vite: {
    plugins: [tailwindcss()],
  },
});

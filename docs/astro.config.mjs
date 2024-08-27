import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc'
// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: '@algorandfoundation/algo-models',
			customCss: [
				'./src/styles/custom.css',
			],
			social: {
				github: 'https://github.com/algorandfoundation/algo-models',
			},
			plugins: [
				// Generate the documentation.
				starlightTypeDoc({
					sidebar: {
						collapsed: true,
						label: "Reference"
					},
					entryPoints: ['../lib/index.ts', '../lib/provider/index.ts'],
					tsconfig: '../tsconfig.json',
				}),
			],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				typeDocSidebarGroup
			],
		}),
	],
});

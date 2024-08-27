import tutorialkit from '@tutorialkit/astro';
import {defineConfig} from 'astro/config';
import starlight from "@astrojs/starlight";
import starlightTypeDoc, {typeDocSidebarGroup} from 'starlight-typedoc';
// https://astro.build/config
export default defineConfig({
    devToolbar: {
        enabled: false
    },
    integrations: [
        tutorialkit({defaultRoutes: "tutorial-only"}),
        starlight({
            title: '@algorandfoundation/algo-models',
            customCss: ['./starlight.css'],
                plugins: [
                    // Generate the documentation.
                    starlightTypeDoc({
                        sidebar: {
                            collapsed: true,
                            label: "Reference"
                        },
                        entryPoints: ['../lib/index.ts', '../lib/provider/index.ts'],
                        tsconfig: '../tsconfig.json'
                    })],
                sidebar: [{
                    label: 'Guides',
                    items: [
                        // Each item here is one entry in the navigation menu.
                        {
                            label: 'Example Guide',
                            slug: 'guides/example'
                        }]
                }, typeDocSidebarGroup]
        }),
    ]
});
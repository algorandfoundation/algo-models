import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import {contentSchema} from "@tutorialkit/types";

const tutorial = defineCollection({
  type: 'content',
  schema: contentSchema,
});

export const collections = {
  tutorial,
  docs: defineCollection({ schema: docsSchema() }),
};

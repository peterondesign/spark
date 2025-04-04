import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import type { SchemaTypeDefinition } from 'sanity';
import schemas from './schemas';

export default defineConfig({
  name: 'default',
  title: 'Sparkus',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2g03ln8v',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [deskTool()],

  schema: {
    types: schemas,
  },
});
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'dhanz-wealth',
  title: 'Dhanz Wealth CMS',
  projectId: '6992crjl',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});

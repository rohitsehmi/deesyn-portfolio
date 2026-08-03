import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Astro for the site, React for the components. The case studies are content,
// so the pages ship no JavaScript unless a component explicitly opts in with a
// client directive. That keeps Core Web Vitals honest while still giving the
// components a real Storybook workshop.
export default defineConfig({
  integrations: [react()],
  build: { inlineStylesheets: 'auto' }
});

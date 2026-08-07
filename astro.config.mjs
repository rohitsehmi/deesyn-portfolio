import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import copyEditor from './tools/copy-editor.mjs';

// Astro for the site, React for the components. The case studies are content,
// so the pages ship no JavaScript unless a component explicitly opts in with a
// client directive. That keeps Core Web Vitals honest while still giving the
// components a real Storybook workshop.
export default defineConfig({
  /*
    The canonical origin. Needed the moment a site answers on more than one
    address: this is served from www.deesyn.com and from the .vercel.app
    deployment URL, and without a canonical those are two copies of every page.
    Astro exposes it as `Astro.site`, which Base.astro turns into <link rel=
    "canonical">. Trailing slash omitted deliberately -- new URL() joins paths
    against it, and a trailing one would double up.
  */
  site: 'https://www.deesyn.com',
  // copyEditor adds nothing to a production build: both its endpoint and its
  // client script are registered inside `command === 'dev'`.
  integrations: [react(), copyEditor()],
  build: { inlineStylesheets: 'auto' }
});

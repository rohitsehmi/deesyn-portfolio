import type { APIRoute } from 'astro';
import { SITE, indexablePages } from '../data/indexable';

/**
 * Generated from the pages the site actually renders. A hand-written
 * sitemap is the list that goes stale the day a study is added.
 * No lastmod: there is no honest date to put on a page that has none.
 */
export const GET: APIRoute = () => {
  const urls = indexablePages()
    .map(
      (page) => `  <url>
    <loc>${SITE}${page.path}</loc>
  </url>`
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};

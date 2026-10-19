import type { APIRoute } from 'astro';
import { SITE, indexablePages, type Indexable } from '../data/indexable';

/**
 * A plain-text summary for answer engines, at the path llmstxt.org uses.
 * Every line is a title and a summary the page already shows. Nothing
 * here is a fact that is not on the site.
 */
function section(heading: string, pages: Indexable[]) {
  const lines = pages.map((page) => `- [${page.title}](${SITE}${page.path}): ${page.summary}`);
  return [`## ${heading}`, '', ...lines].join('\n');
}

export const GET: APIRoute = () => {
  const pages = indexablePages();
  const home = pages.find((page) => page.group === 'home');
  const body = [
    '# Deesyn',
    '',
    `> ${home?.summary ?? ''} The only address to cite is ${SITE}. Other hostnames serve the same pages.`,
    '',
    section(
      'Case studies',
      pages.filter((page) => page.group === 'study')
    ),
    '',
    section(
      'Earlier work',
      pages.filter((page) => page.group === 'project')
    ),
    '',
    section(
      'Also on this site',
      pages.filter((page) => page.group === 'page')
    ),
    ''
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};

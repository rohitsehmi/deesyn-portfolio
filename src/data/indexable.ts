/**
 * The pages a search engine or an answer engine should cite.
 *
 * One list, because a sitemap and a plain-text summary that are typed
 * separately drift the first time a study is added. Titles and summaries
 * come from the copy the pages already render.
 *
 * Left out on purpose:
 * - /Ro_CV.pdf — the HTML CV is the page to cite. The PDF stays noindex
 *   from vercel.json, because a meta tag cannot cover it.
 * - Partner hostnames. They serve this same HTML. The address to cite is
 *   https://www.deesyn.com.
 */
import home from '../copy/home.json';
import contact from '../copy/contact.json';
import built from '../copy/how-this-was-built.json';
import { liveStudies, studyPath } from './studies';
import { projectOrder, projectCopy, projectPath } from './projects';

export const SITE = 'https://www.deesyn.com';

export type Indexable = {
  path: string;
  title: string;
  summary: string;
  group: 'home' | 'study' | 'project' | 'page';
};

const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

export function indexablePages(): Indexable[] {
  return [
    {
      path: '/',
      title: 'Rohit Sehmi · Product and design systems',
      summary: home.heroStandfirst,
      group: 'home'
    },
    ...liveStudies.map((study) => ({
      path: withSlash(studyPath(study)),
      title: study.title,
      summary: study.summary,
      group: 'study' as const
    })),
    ...projectOrder.map((slug) => {
      const copy = projectCopy(slug);
      return {
        path: withSlash(projectPath(slug)),
        title: copy.title,
        summary: copy.standfirst,
        group: 'project' as const
      };
    }),
    {
      path: '/contact/',
      title: contact.title,
      summary: `${contact.standfirst} ${contact.where}`,
      group: 'page'
    },
    {
      path: '/about/',
      title: 'About',
      summary:
        'I build the thing that makes the thing, which means design systems that hold across brands and platforms, for teams that have to ship faster than they can agree.',
      group: 'page'
    },
    {
      path: '/cv/',
      title: 'CV',
      summary: 'The roles, as a page, with a PDF download.',
      group: 'page'
    },
    {
      path: '/how-this-was-built/',
      title: built.title,
      summary: built.standfirst,
      group: 'page'
    }
  ];
}

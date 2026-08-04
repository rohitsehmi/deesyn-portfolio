import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseStudyTile } from './CaseStudyTile';
import { studies, studyPath } from '../data/studies';

const meta = { title: 'Content/CaseStudyTile', component: CaseStudyTile } satisfies Meta<typeof CaseStudyTile>;
export default meta;
type S = StoryObj<typeof meta>;

/** Real content, read from the same list the site builds its index from. */
export const Default: S = {
  args: {
    title: studies[0].title,
    summary: studies[0].summary,
    discipline: studies[0].discipline,
    href: studyPath(studies[0]),
    image: { alt: `Cover image for ${studies[0].title}` }
  }
};

/** Without an image, for the next-study link at the foot of a case study. */
export const NoImage: S = {
  args: {
    title: studies[1].title,
    summary: studies[1].summary,
    discipline: studies[1].discipline,
    href: studyPath(studies[1])
  }
};

/** The index grid. Two studies, two cells, built from the list. */
export const Grid: S = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--primitive-layout-l48)' }}>
      {studies.map((s) => (
        <CaseStudyTile
          key={s.slug}
          title={s.title}
          summary={s.summary}
          discipline={s.discipline}
          href={studyPath(s)}
          image={{ alt: `Cover image for ${s.title}` }}
        />
      ))}
    </div>
  )
};

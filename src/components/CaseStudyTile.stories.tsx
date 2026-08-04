import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseStudyTile } from './CaseStudyTile';
import { studies, studyPath } from '../data/studies';

const meta = { title: 'Content/CaseStudyTile', component: CaseStudyTile } satisfies Meta<typeof CaseStudyTile>;
export default meta;
type S = StoryObj<typeof meta>;

const grid = (variant: 'bare' | 'card') => (
  <ul style={{
    listStyle: 'none', margin: 0, padding: 0,
    display: 'grid', gridTemplateColumns: `repeat(${studies.length}, 1fr)`,
    gap: 'var(--primitive-layout-l48)', alignItems: 'start'
  }}>
    {studies.map((s) => (
      <li key={s.slug}>
        <CaseStudyTile
          title={s.title}
          summary={s.summary}
          discipline={s.discipline}
          href={studyPath(s)}
          variant={variant}
          image={{ alt: `Cover image for ${s.title}` }}
        />
      </li>
    ))}
  </ul>
);

/**
 * The decision, on the real content. Switch the toolbar between base, sunken
 * and inverse: the card only reads as an object where its surface differs from
 * the band, and on a sunken band the difference is one luminance step.
 *
 * Chromatic snapshots this light and dark, so both are covered without
 * anyone having to remember to look.
 */
export const BareVersusCard: S = {
  args: { title: '', summary: '', discipline: '', href: '#' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--primitive-layout-l96)' }}>
      <section>
        <p style={{ margin: '0 0 var(--primitive-space-sp800)', font: 'var(--type-emphasis-1)', color: 'var(--semantic-fg-secondary)' }}>
          Bare. The band groups them, the cue carries the affordance.
        </p>
        {grid('bare')}
      </section>
      <section>
        <p style={{ margin: '0 0 var(--primitive-space-sp800)', font: 'var(--type-emphasis-1)', color: 'var(--semantic-fg-secondary)' }}>
          Card. A surface and a border do the grouping instead.
        </p>
        {grid('card')}
      </section>
    </div>
  )
};

export const Bare: S = {
  args: {
    title: studies[0].title,
    summary: studies[0].summary,
    discipline: studies[0].discipline,
    href: studyPath(studies[0]),
    image: { alt: `Cover image for ${studies[0].title}` }
  }
};

export const Card: S = {
  args: { ...Bare.args!, variant: 'card' } as never
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

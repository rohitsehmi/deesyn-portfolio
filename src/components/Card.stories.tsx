import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Media } from './Media';
import { Tag } from './Tag';
import { ArrowLink } from './Link';

const meta = { title: 'Layout/Card', component: Card } satisfies Meta<typeof Card>;
export default meta;
type S = StoryObj<typeof meta>;

/** Media bleeds to the edge because padding lives on the body, not the card. */
export const CaseStudy: S = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <Card
        media={<Media alt="The consolidated review queue" ratio="16-9" fit="bleed" />}
        actions={<ArrowLink href="#">Read the case study</ArrowLink>}
      >
        <Tag variant="accent">designer</Tag>
        <h3 style={{ margin: 0, font: "500 20px/1.3 'Hanken Grotesk', Inter, sans-serif", letterSpacing: '-0.01em' }}>
          Rebuilding onboarding across 40 markets
        </h3>
        <p style={{ margin: 0, font: '400 14px/1.43 Inter, sans-serif', color: 'var(--semantic-fg-secondary)' }}>
          One line that says what the problem was, and earns the click.
        </p>
      </Card>
    </div>
  )
};

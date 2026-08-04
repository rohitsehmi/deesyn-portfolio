import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link, ArrowLink } from './Link';

const meta = { title: 'Action/Link', component: Link } satisfies Meta<typeof Link>;
export default meta;
type S = StoryObj<typeof meta>;

/** Inline links are underlined. An unstyled link in body copy is an a11y failure. */
export const InProse: S = {
  render: () => (
    <p className="type-body-1" style={{ maxWidth: '65ch', color: 'var(--semantic-fg-secondary)' }}>
      The rollout covered forty markets in eleven weeks. The constraint was not design
      capacity but review throughput, which is set out in <Link href="#">the delivery note</Link>.
    </p>
  )
};

/** Standalone CTA. Never underlined; the arrow translates 4px on hover. */
export const Arrow: S = {
  render: () => <ArrowLink href="#">Read the case study</ArrowLink>
};

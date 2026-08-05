import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link, ArrowLink } from './Link';

// Default args cover Link's required props, so the stories below can supply
// everything through `render` without each one having to restate them.
const meta = {
  title: 'Action/Link',
  component: Link,
  args: { href: '#', children: 'Read the case study' }
} satisfies Meta<typeof Link>;
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

/**
 * The two directions, and the rule for picking one: the thin arrow for
 * somewhere else on this site, the diagonal for somewhere off it.
 *
 * The hover travel follows the glyph — right for the thin arrow, up and right
 * for the diagonal. A diagonal arrow sliding flat sideways reads as a mistake
 * in a way that is hard to name and easy to see. Hover both.
 */
export const Directions: S = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--primitive-layout-l40)', justifyItems: 'start' }}>
      <ArrowLink href="#">Read the case study</ArrowLink>
      <ArrowLink href="#" icon="arrow-up-right" target="_blank" rel="noopener noreferrer">
        linkedin.com/in/rohitsehmi
      </ArrowLink>
    </div>
  )
};

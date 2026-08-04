import type { Meta, StoryObj } from '@storybook/react-vite';
import { Band } from './Band';
import { Button } from './Button';
import { Tag } from './Tag';
import { ArrowLink } from './Link';

const meta = { title: 'Layout/Band', component: Band } satisfies Meta<typeof Band>;
export default meta;
type S = StoryObj<typeof meta>;

const Sample = () => (
  <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
    <Tag variant="accent">designer</Tag>
    <h2 className="type-heading-l" style={{ margin: 0 }}>
      A band owns the foreground of everything inside it
    </h2>
    <div style={{ display: 'flex', gap: 12 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
    <ArrowLink href="#">Read the case study</ArrowLink>
  </div>
);

/**
 * The legal rhythm. Nothing inside any band declares its own colour — every
 * component flips because the band re-declares the semantic custom properties
 * for its subtree. This is the CSS equivalent of the zero-override proof in Figma.
 */
export const Sequence: S = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div>
      <Band role="base"><Sample /></Band>
      <Band role="sunken"><Sample /></Band>
      <Band role="inverse" scale="feature"><Sample /></Band>
      <Band role="inverse-raised"><Sample /></Band>
      <Band role="base"><Sample /></Band>
    </div>
  )
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag';

const meta = { title: 'Content/Tag', component: Tag, args: { children: 'designer' } } satisfies Meta<typeof Tag>;
export default meta;
type S = StoryObj<typeof meta>;

export const Neutral: S = { args: { variant: 'neutral' } };
export const Accent: S = { args: { variant: 'accent' } };

/** Accent marks the claim; neutral carries the facts. */
export const Metadata: S = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag variant="accent">designer</Tag>
      <Tag>2024</Tag>
      <Tag>iOS · Android · Web</Tag>
    </div>
  )
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { iconNames } from './icon-paths';

const meta = { title: 'Icons/Icon', component: Icon, args: { name: 'arrow-thin-right' } } satisfies Meta<typeof Icon>;
export default meta;
type S = StoryObj<typeof meta>;

export const Single: S = {};

/** Every icon is a real Revolut asset, used verbatim. None are hand-drawn. */
export const All: S = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      {iconNames.map((name) => (
        <div key={name} style={{ display: 'grid', gap: 8, justifyItems: 'center', width: 110 }}>
          <Icon name={name} />
          <span style={{ font: '400 11px/1.3 Inter, sans-serif', color: 'var(--semantic-fg-secondary)' }}>{name}</span>
        </div>
      ))}
    </div>
  )
};

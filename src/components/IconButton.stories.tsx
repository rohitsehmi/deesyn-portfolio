import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';

const meta = {
  title: 'Action/Icon Button',
  component: IconButton,
  args: { icon: 'arrow-thin-right', 'aria-label': 'Next case study' }
} satisfies Meta<typeof IconButton>;
export default meta;
type S = StoryObj<typeof meta>;

export const Primary: S = {};

/** Square at every size — one token drives both axes, so it is a true circle. */
export const Matrix: S = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['primary', 'secondary', 'ghost'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <IconButton key={size} variant={variant} size={size} icon="arrow-thin-right" aria-label={`Next, ${size}`} />
          ))}
          <IconButton variant={variant} size="lg" icon="cross" aria-label="Close" disabled />
        </div>
      ))}
    </div>
  )
};

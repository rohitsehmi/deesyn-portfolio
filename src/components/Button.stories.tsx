import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Action/Button',
  component: Button,
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] }
  },
  args: { children: 'Read the case study' }
} satisfies Meta<typeof Button>;
export default meta;
type S = StoryObj<typeof meta>;

export const Primary: S = { args: { variant: 'primary' } };
export const Secondary: S = { args: { variant: 'secondary' } };
export const Ghost: S = { args: { variant: 'ghost' } };

/** The full matrix, so a regression in any cell fails the Chromatic build. */
export const Matrix: S = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['primary', 'secondary', 'ghost'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} variant={variant} size={size}>Button</Button>
          ))}
          <Button variant={variant} size="lg" disabled>Disabled</Button>
          <Button variant={variant} size="lg" iconTrailing="arrow-thin-right">With icon</Button>
        </div>
      ))}
    </div>
  )
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeToggle } from './ThemeToggle';

const meta = { title: 'Chrome/ThemeToggle', component: ThemeToggle } satisfies Meta<typeof ThemeToggle>;
export default meta;
type S = StoryObj<typeof meta>;

/**
 * Fixed to the viewport, so in Storybook it sits in the corner of the canvas
 * rather than of the story.
 *
 * Clicking it sets `data-theme` on the document, which changes the whole
 * Storybook chrome as well as the story. That is the component working, not a
 * bug: it is a document-level control and there is nowhere smaller for it to
 * act on.
 */
export const Default: S = { args: { size: 'lg' } };

/** 48 is the marketing minimum and the right default; the others are here for
 *  comparison rather than for use. */
export const Sizes: S = {
  args: { size: 'lg' },
  render: () => (
    <div style={{ position: 'relative', height: 120 }}>
      <p style={{ margin: 0, font: 'var(--type-body-2)', color: 'var(--semantic-fg-secondary)' }}>
        The toggle is position: fixed, so all three would stack in the same
        corner. Use the Default story and the toolbar to check it instead.
      </p>
    </div>
  )
};

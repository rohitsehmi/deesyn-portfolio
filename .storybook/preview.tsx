import type { Preview, Decorator } from '@storybook/react-vite';
import React from 'react';
import '../src/styles/tokens.css';
import '../src/styles/base.css';

/**
 * Every story renders inside a band, because in this system a band owns the
 * foreground of everything inside it — a component has no colour of its own.
 * Switching the band globally is how we check that a component flips with no
 * override, which is the same property asserted in Figma.
 */
const withBand: Decorator = (Story, ctx) => (
  <div data-band={ctx.globals.band} style={{ padding: 40 }}>
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withBand],
  globalTypes: {
    band: {
      description: 'Band role — the component should flip with no override',
      defaultValue: 'base',
      toolbar: {
        title: 'Band',
        items: [
          { value: 'base', title: 'base' },
          { value: 'sunken', title: 'sunken' },
          { value: 'inverse', title: 'inverse' },
          { value: 'inverse-raised', title: 'inverse-raised' }
        ]
      }
    }
  },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    // Chromatic snapshots each story on a light and a dark band, so a
    // regression in either mode fails the build.
    chromatic: { modes: { light: { theme: 'light' }, dark: { theme: 'dark' } } }
  }
};
export default preview;

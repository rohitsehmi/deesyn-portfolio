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

/**
 * One build serves three brands, chosen by hostname. The workshop had no way to
 * show that: `Marks/Logo` rendered the Ro × Revolut lockup only, so the one
 * component whose whole job is to differ per brand was the one you could not
 * see differ. This makes the multi-brand system a demonstration rather than
 * something the workshop hides.
 *
 * It sets the attribute on the ROOT, not on a wrapper, and that is forced
 * rather than tidy. The default arm in base.css is
 * `:root:not([data-brand]) [data-brand-only]:not([data-brand-only~='revolut'])`,
 * which keys off the absence of the attribute on the root itself. Put
 * `data-brand="wise"` on a div and that rule still matches — so the Revolut
 * arm would hide the Wise logotype at the same moment the Wise arm showed it,
 * and the lockup would render with no partner mark at all.
 *
 * Revolut is the default and carries no attribute, exactly as it does live.
 */
const withBrand: Decorator = (Story, ctx) => {
  const brand = ctx.globals.brand;
  React.useEffect(() => {
    const root = document.documentElement;
    if (brand && brand !== 'revolut') root.dataset.brand = brand;
    else delete root.dataset.brand;
  }, [brand]);
  return <Story />;
};

const preview: Preview = {
  decorators: [withBand, withBrand],
  globalTypes: {
    brand: {
      description: 'Hostname brand — the lockup should swap with no override',
      defaultValue: 'revolut',
      toolbar: {
        title: 'Brand',
        items: [
          { value: 'revolut', title: 'Ro × Revolut (default)' },
          { value: 'wise', title: 'Ro × Wise' },
          { value: 'healf', title: 'Ro × Healf' }
        ]
      }
    },
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

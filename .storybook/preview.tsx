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
 * One build serves five brands, chosen by hostname. The workshop had no way to
 * show that: `Marks/Logo` rendered a single lockup, so the one component whose
 * whole job is to differ per brand was the one you could not
 * see differ. This makes the multi-brand system a demonstration rather than
 * something the workshop hides.
 *
 * It sets the attribute on the ROOT, not on a wrapper, and that is forced
 * rather than tidy. The default arm in base.css is
 * `:root:not([data-brand]) [data-brand-only]:not([data-brand-only~='deesyn'])`,
 * which keys off the absence of the attribute on the root itself. Put
 * `data-brand="wise"` on a div and that rule still matches — so the default
 * arm would hide the Wise logotype at the same moment the Wise arm showed it,
 * and the lockup would render with no partner mark at all.
 *
 * `deesyn` is the default and carries no attribute, exactly as it does live.
 * It is the one option in this toolbar that shows the MARK rather than a
 * lockup: it has no partner, so its `x` and every logotype are gated away and
 * Logo.css narrows the viewport to the disc. Picking it is the only way to see
 * in the workshop what the apex actually renders.
 *
 * SETTING IT ON THE ROOT IS ALSO WHY BRAND PACKS NEEDED NO WORK HERE. Since
 * tokens/brands/ landed, a brand changes the whole palette rather than just the
 * lockup, and every rule that does it is scoped `:root[data-brand="x"]` in the
 * generated tokens.css this file already imports. So the toolbar switched from
 * swapping one logotype to re-theming every story, in both modes, with no
 * change to the decorator — which is the clearest evidence that the packs sit
 * in the token layer rather than in the components.
 *
 * What it does NOT do is snapshot per brand. Chromatic renders each story light
 * and dark at the default brand, so a palette regression in Wise or Healf would
 * not fail a build. Adding brand to that matrix triples the snapshot count, so
 * it is a cost decision rather than an oversight — see CLAUDE.md.
 */
const withBrand: Decorator = (Story, ctx) => {
  const brand = ctx.globals.brand;
  React.useEffect(() => {
    const root = document.documentElement;
    if (brand && brand !== 'deesyn') root.dataset.brand = brand;
    else delete root.dataset.brand;
  }, [brand]);
  return <Story />;
};

const preview: Preview = {
  decorators: [withBand, withBrand],
  globalTypes: {
    brand: {
      description: 'Hostname brand — swaps the lockup AND the whole palette, with no override',
      defaultValue: 'deesyn',
      toolbar: {
        title: 'Brand',
        items: [
          { value: 'deesyn', title: 'Ro (default)' },
          { value: 'wise', title: 'Ro × Wise' },
          { value: 'healf', title: 'Ro × Healf' },
          { value: 'ticketmaster', title: 'Ro × Ticketmaster' },
          { value: 'asos', title: 'Ro × ASOS' },
          { value: 'spotify', title: 'Ro × Spotify' }
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

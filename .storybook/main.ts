import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Components are pure React and consume tokens through CSS custom properties,
  // so Storybook needs no Astro integration — it renders them directly.
  //
  // public/ holds the generated favicon set and nothing else. It is listed here
  // only because it now contains real committed files — briefly it did not, and
  // an empty directory holds no tracked files, so git prunes it on checkout and
  // it is absent from a fresh clone. Storybook treats a missing staticDir as a
  // hard error, which broke build-storybook everywhere except the machine that
  // still had the stale folder. If public/ ever empties again, drop this line
  // with it rather than committing a .gitkeep to prop up a dependency on
  // nothing.
  staticDirs: ['../public'],
  core: { disableTelemetry: true }
};
export default config;

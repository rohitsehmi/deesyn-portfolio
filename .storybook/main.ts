import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Components are pure React and consume tokens through CSS custom properties,
  // so Storybook needs no Astro integration — it renders them directly.
  //
  // No staticDirs. This used to serve ../public so stories could reference the
  // same asset paths as the site, but every image now lives in src/assets/ and
  // is imported, which is what lets Astro optimise it. That left public/ empty,
  // and an empty directory holds no tracked files — so git prunes it on
  // checkout and it does not exist on a fresh clone at all. Storybook treats a
  // missing staticDir as a hard error, so the build failed everywhere except
  // the machine that happened to still have the stale folder lying around.
  //
  // Put it back the moment public/ has a real, committed file in it: a favicon,
  // robots.txt, an og image. Until then it is a dependency on nothing.
  core: { disableTelemetry: true }
};
export default config;

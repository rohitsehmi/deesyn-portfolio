import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: { name: '@storybook/react-vite', options: {} },
  // Components are pure React and consume tokens through CSS custom properties,
  // so Storybook needs no Astro integration — it renders them directly.
  // public/ is served so stories can reference the same asset paths the site does.
  staticDirs: ['../public'],
  core: { disableTelemetry: true }
};
export default config;

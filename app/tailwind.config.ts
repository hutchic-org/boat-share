import type { Config } from 'tailwindcss'

export default <Partial<Config>> {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
    './src/node_modules/@nuxt/ui/dist/**/*.css',  // Include Nuxt UI styles
    './src/node_modules/tailwindcss/**/*.css',    // Include Tailwind CSS files from node_modules
    './src/node_modules/@tailwindcss/**/*.css',   // Include any Tailwind CSS plugins
    './src/node_modules/headlessui/**/*.js',      // Include Headless UI if used
    './src/node_modules/@headlessui/**/*.js',     // Include Headless UI for Tailwind CSS plugins
  ],
  theme: {
    extend: {
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9'
      }
    }
  },
}

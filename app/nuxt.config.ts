// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vite-pwa/nuxt"],
  pwa: {
    manifest: {
      name: 'Boat Sharing',
      short_name: 'Boat',
      description: 'An app for sharing a boat among a pre-defined set of users.',
      lang: 'en',
      display: 'standalone',
      start_url: '/',
      background_color: '#ffffff',
      theme_color: '#4DBA87',
      icons: [
        {
          src: '/icons/50.png',
          sizes: '50x50',
          type: 'image/png'
        },
        {
          src: '/icons/192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/512.png',
          sizes: '512x512',
          type: 'image/png'
        },
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: true,
      type: "module"
    },
    client: {
      installPrompt: true
    }
  }
})

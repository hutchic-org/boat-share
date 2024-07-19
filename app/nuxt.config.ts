// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vite-pwa/nuxt", "nuxt-vue3-google-signin"],
  pwa: {
    manifest: {
      name: 'Boat Sharing App',
      short_name: 'Boat',
      description: 'An app for sharing a boat among a pre-defined set of users via a Google Calendar backend.',
      lang: 'en',
      display: 'standalone',
      scope: process.env.BASE_URL || '/',
      start_url: process.env.BASE_URL || '/',
      background_color: '#ffffff',
      theme_color: '#4DBA87',
      icons: [
        {
          src: `${process.env.BASE_URL || ''}/icons/50.png`,
          sizes: '50x50',
          type: 'image/png'
        },
        {
          src: `${process.env.BASE_URL || ''}/icons/192.png`,
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: `${process.env.BASE_URL || ''}/icons/512.png`,
          sizes: '512x512',
          type: 'image/png'
        },
      ]
    },
    workbox: {
      navigateFallback: `${process.env.BASE_URL || ''}/`
    },
    client: {
      installPrompt: true
    }
  },
  googleSignIn: {
    clientId: '753759858538-nufcl1qbhf9gpc7v9qs4seramd7ni2rm.apps.googleusercontent.com',
  },
  runtimeConfig: {
    public: {
      googleCalendarId: '7417fba20bb0d2c726dba1575d7d6421014047d0dbfe15875c8dd3588796f8c6@group.calendar.google.com',
      oauthClientId: '753759858538-nufcl1qbhf9gpc7v9qs4seramd7ni2rm.apps.googleusercontent.com',
    }
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
        clientPort: 3000
      }
    }
  },
  app: {
    baseURL: process.env.BASE_URL || '/',
  },
  compatibilityDate: '2024-07-03',
})

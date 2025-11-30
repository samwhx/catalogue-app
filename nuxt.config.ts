// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  // PostCSS handled by @nuxtjs/tailwindcss module
  srcDir: 'app/',

  // Deployment configuration
  nitro: {
    preset: 'cloudflare-pages'
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://catalogue-service.fly.dev',
      defaultCatalog: process.env.NUXT_PUBLIC_DEFAULT_CATALOG || 'atlas-kitchen-2024',
    },
  },

  app: {
    head: {
      title: 'Atlas Gastro Bar',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Experience Culinary Excellence at Atlas Gastro Bar.' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})

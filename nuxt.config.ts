// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  typescript: {
    tsConfig: {
      include: ['types/**/*.d.ts']
    }
  }
})

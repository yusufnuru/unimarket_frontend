import tailwindcss from '@tailwindcss/vite';
import VueDevTools from 'vite-plugin-vue-devtools';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@formkit/auto-animate/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  css: ['@/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
      VueDevTools({
        launchEditor: 'webstorm',
      }),
    ],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
  colorMode: {
    classSuffix: '',
  },
  eslint: {
    lintOnStart: false,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL, // Backend URL
      nodeEnv: process.env.NODE_ENV,
      wsBase: process.env.NUXT_PUBLIC_WS_BASE_URL, // WebSocket URL
    },
  },
  plugins: ['@/plugins/vue-query.ts'],
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,
    vscode: {
      enabled: false,
    },
  },
});

import { fileURLToPath, URL } from 'node:url'

import type { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { cool } from './build/index.ts'
import { proxy } from "./src/config/proxy"

// https://vitejs.dev/config/
export default (): UserConfig => {
  return {
    base: '/',
    server: {
      port: 3000,
      proxy,
      hmr: {
        overlay: true
      }
    },
    plugins: [vue(), vueJsx(), cool()],
    css: {
      preprocessorOptions: {
        scss: {
          charset: false
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
}

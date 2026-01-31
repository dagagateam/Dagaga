import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler'],
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        // target: 'https://i14b110.p.ssafy.io',
        target: 'http://ec2-13-125-219-161.ap-northeast-2.compute.amazonaws.com/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

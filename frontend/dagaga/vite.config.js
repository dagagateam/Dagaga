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
    // 로컬 개발 시: 프론트엔드만 로컬에서 실행하고 EC2 백엔드로 API 요청
    // 프로덕션: nginx.conf가 같은 Docker 네트워크 내 백엔드 컨테이너로 프록시
    proxy: {
      '/api': {
        target: 'https://i14b110.p.ssafy.io',
        changeOrigin: true,
        secure: false,
        // CORS 문제 해결을 위한 설정
        rewrite: (path) => path,
      },
    },
  },
})

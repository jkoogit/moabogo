import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 환경변수 ALLOWED_HOSTS가 있으면 쉼표 기준으로 자르고, 없으면 기본값 ['localhost'] 사용
const allowedHosts = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(',').map((host) => host.trim())
  : ['dev.moabogo.com','stg.moabogo.com','www.moabogo.com', 'moabogo.com','localhost'];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: allowedHosts,
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 환경변수 ALLOWED_HOSTS가 명시된 경우 해당 호스트만 허용하고, 미설정 시 AI Studio Cloud Run 및 임의 프리뷰 도메인 허용
const rawAllowedHosts = process.env.ALLOWED_HOSTS?.trim();
const allowedHosts: true | string[] =
  rawAllowedHosts && rawAllowedHosts !== 'true' && rawAllowedHosts !== '*'
    ? rawAllowedHosts.split(',').map((host) => host.trim()).filter(Boolean)
    : true;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts,
    hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
  },
});
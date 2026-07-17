import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, projectRoot, '');
  const proxyTarget = environment.VITE_DEV_API_TARGET?.trim();

  return {
    root: projectRoot,
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: proxyTarget
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true
            }
          }
        : undefined
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      cssMinify: true,
      reportCompressedSize: false
    }
  };
});

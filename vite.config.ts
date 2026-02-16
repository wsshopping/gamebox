import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const buildVersion = String(Date.now());
    const env = loadEnv(mode, '.', '');
    const allowedHosts = (env.VITE_ALLOWED_HOSTS || 'twhz.ahqlhkj.top')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const versionManifestPlugin = {
      name: 'portal-version-manifest',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify(
            {
              version: buildVersion,
              builtAt: new Date().toISOString()
            },
            null,
            2
          )
        });
      }
    };
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts,
        proxy: {
          '/api/v1': {
            target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:8888',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/v1/, '')
          },
          '/uploads': {
            target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:8888',
            changeOrigin: true
          }
        }
      },
      plugins: [react(), versionManifestPlugin],
      define: {
        __APP_VERSION__: JSON.stringify(buildVersion),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

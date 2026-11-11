import { defineConfig, loadEnv } from 'vite'
import type { IncomingMessage } from 'node:http'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { applyResult, feedbackTarget, runFeedback } from './api/feedback.ts'

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let tooBig = false;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 4096) {
        tooBig = true;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooBig || chunks.length === 0) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        resolve(null);
      }
    });
    req.on('error', reject);
  });
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const feedbackUrl = feedbackTarget(loadEnv(mode, process.cwd(), '').FEEDBACK_URL);
  return {
    plugins: [
      react(),
      {
        name: 'feedback-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/feedback', async (req, res) => {
            try {
              const body = req.method === 'POST' ? await readJsonBody(req) : undefined;
              const result = await runFeedback(req.method ?? 'GET', body, feedbackUrl);
              applyResult(res, result);
            } catch {
              applyResult(res, { status: 400, json: { ok: false, error: 'invalid' } });
            }
          });
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['assets/favicon.svg', 'assets/map1.jpg', 'assets/map2.jpg', 'assets/author.png', 'assets/pwa-192x192.png', 'assets/pwa-512x512.png', 'assets/apple-touch-icon.png'],
        manifest: {
          name: 'FieldStyle Japan 2026 Navigator',
          short_name: 'FieldStyle',
          description: 'FieldStyle Japan 2026 Booth Search & Navigation',
          theme_color: '#1e293b',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'assets/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'assets/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [200]
                }
              }
            }
          ]
        }
      })
    ],
  };
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleDescribe, handleHealthStory } from './server/oxion.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loaded with an empty prefix so non-VITE_ prefixed server secrets are
  // readable here in Node, WITHOUT Vite ever injecting them into the
  // client bundle (only vite.config.js and server/oxion.js ever see them).
  const env = loadEnv(mode, process.cwd(), '')

  const aiConfig = {
    apiKey: env.AI_API_KEY || '',
    apiUrl: env.AI_API_URL || '',
    model: env.AI_MODEL || '',
  }

  /** Minimal connect-style dev middleware acting as our "server API route". */
  function herhealthApiPlugin() {
    return {
      name: 'herhealth-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url || !req.url.startsWith('/api/') || req.method !== 'POST') {
            return next()
          }

          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json')
            try {
              const payload = body ? JSON.parse(body) : {}
              let result

              if (req.url === '/api/describe') {
                result = await handleDescribe(payload, aiConfig)
              } else if (req.url === '/api/health-story') {
                result = await handleHealthStory(payload, aiConfig)
              } else {
                res.statusCode = 404
                res.end(JSON.stringify({ error: 'Not found' }))
                return
              }

              res.statusCode = 200
              res.end(JSON.stringify(result))
            } catch (err) {
              res.statusCode = 500
              res.end(
                JSON.stringify({
                  error: 'Server error',
                  message: String((err && err.message) || err),
                })
              )
            }
          })
        })
      },
    }
  }

  return {
    plugins: [react(), tailwindcss(), herhealthApiPlugin()],
  }
})

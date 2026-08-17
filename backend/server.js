import { connectDB } from './src/db/connect.js'
import { createApp } from './src/app.js'
import { env } from './src/config/env.js'
import { initStore } from './src/data/store.js'

async function start() {
  await connectDB()
  await initStore() // no-op, kept for compatibility
  const app = createApp()

  app.listen(env.port, () => {
    console.log(`Sentinel RBAC API listening on http://localhost:${env.port}`)
    console.log(`CORS allowed origin: ${env.clientOrigin}`)
    console.log(`Environment: ${env.nodeEnv}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

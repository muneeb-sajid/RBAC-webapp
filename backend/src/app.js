import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { env, isProd } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import roleRoutes from './routes/roleRoutes.js'
import permissionRoutes from './routes/permissionRoutes.js'
import { notFoundHandler } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    })
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(morgan(isProd ? 'combined' : 'dev'))

  const limiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use('/api', limiter)

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/roles', roleRoutes)
  app.use('/api/permissions', permissionRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

import 'dotenv/config'

function required(name, fallback) {
  const value = process.env[name] ?? fallback

  if (value === undefined) {
    console.log(`Missing required environment variable: ${name}`)
  }

  return value
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  jwtSecret: required(
    'JWT_SECRET',
    'dev-only-insecure-secret-change-me'
  ),

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  rateLimitWindowMs: Number(
    process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000
  ),

  rateLimitMax: Number(
    process.env.RATE_LIMIT_MAX || 300
  ),

  mongoUri: required(
    'MONGO_URI',
    'mongodb://localhost:27017/rbac-admin'
  ),

  EMAIL_USER: required('EMAIL_USER'),
  EMAIL_PASSWORD: required('EMAIL_PASSWORD'),
}

export const isProd = env.nodeEnv === 'production'
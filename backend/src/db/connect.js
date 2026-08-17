import mongoose from 'mongoose'
import { env } from '../config/env.js'

let isConnected = false

export async function connectDB() {
  if (isConnected) return

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    console.log('MongoDB connected:', mongoose.connection.host)
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected.')
  isConnected = false
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message)
})

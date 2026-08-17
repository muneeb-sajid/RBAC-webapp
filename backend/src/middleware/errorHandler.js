import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { isProd } from '../config/env.js'

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Translate Mongoose errors into friendly ApiErrors before responding.

  // Invalid ObjectId (e.g. /users/not-an-id)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    err = ApiError.badRequest('Invalid ID format.')
  }

  // Mongoose unique index violation
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    err = ApiError.conflict(`A record with that ${field} already exists.`)
  }

  // Mongoose schema validation failure
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    err = ApiError.badRequest(messages.join(' '))
  }

  const isApiError = err instanceof ApiError
  const statusCode = isApiError ? err.statusCode : 500
  const message = isApiError ? err.message : 'Something went wrong on our end.'

  if (!isApiError) {
    console.error(err)
  }

  res.status(statusCode).json({
    error: {
      message,
      details: isApiError ? err.details : undefined,
      stack: !isProd && !isApiError ? err.stack : undefined,
    },
  })
}

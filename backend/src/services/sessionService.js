import crypto from 'crypto'
import mongoose from 'mongoose'
import Session from '../models/Session.js'
import { env } from '../config/env.js'

// Mirrors JWT_EXPIRES_IN roughly, in milliseconds, for setting expiresAt on
// the Session document. Only a handful of formats are supported (matches
// what's realistically put in .env: '7d', '12h', '30m', or a plain number
// of seconds) — falls back to 7 days if unparsable.
function resolveExpiryMs(value) {
  if (typeof value === 'number') return value * 1000
  const match = /^(\d+)([smhd])$/.exec(String(value).trim())
  if (!match) return 7 * 24 * 60 * 60 * 1000
  const amount = Number(match[1])
  const unit = match[2]
  const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }
  return amount * unitMs[unit]
}

function toObj(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc }
  obj.id = obj._id.toString()
  obj.userId = obj.userId?.toString ? obj.userId.toString() : obj.userId
  obj.revokedBy = obj.revokedBy?.toString ? obj.revokedBy.toString() : obj.revokedBy
  delete obj._id
  delete obj.__v
  return obj
}

export async function createSession({ userId, ipAddress, userAgent, device, browser }) {
  const sessionId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + resolveExpiryMs(env.jwtExpiresIn))
  const doc = await Session.create({
    sessionId,
    userId,
    ipAddress,
    userAgent,
    device,
    browser,
    lastActiveAt: new Date(),
    expiresAt,
    status: 'ACTIVE',
  })
  return toObj(doc)
}

export async function findActiveSession(sessionId) {
  if (!sessionId) return null
  const doc = await Session.findOne({ sessionId })
  if (!doc) return null

  // Lazily mark expired sessions instead of a background job.
  if (doc.status === 'ACTIVE' && doc.expiresAt.getTime() < Date.now()) {
    doc.status = 'EXPIRED'
    await doc.save()
  }
  return toObj(doc)
}

export async function touchSession(sessionId) {
  if (!sessionId) return
  await Session.updateOne({ sessionId, status: 'ACTIVE' }, { $set: { lastActiveAt: new Date() } })
}

export async function endSessionOnLogout(sessionId) {
  if (!sessionId) return null
  const doc = await Session.findOneAndUpdate(
    { sessionId, status: 'ACTIVE' },
    { $set: { status: 'LOGGED_OUT', revokedAt: new Date() } },
    { new: true }
  )
  return doc ? toObj(doc) : null
}

export async function revokeSession(sessionId, revokedBy, reason = 'Revoked by administrator') {
  const doc = await Session.findOneAndUpdate(
    { sessionId, status: 'ACTIVE' },
    { $set: { status: 'REVOKED', revokedAt: new Date(), revokedBy, revokedReason: reason } },
    { new: true }
  )
  return doc ? toObj(doc) : null
}

export async function revokeAllSessionsForUser(userId, revokedBy, reason = 'Logged out of all sessions by administrator') {
  const result = await Session.updateMany(
    { userId, status: 'ACTIVE' },
    { $set: { status: 'REVOKED', revokedAt: new Date(), revokedBy, revokedReason: reason } }
  )
  return result.modifiedCount || 0
}

export async function listSessions({ userId, status, page = 1, pageSize = 20 } = {}) {
  const filter = {}
  if (userId) filter.userId = userId
  if (status && status !== 'all') filter.status = status

  const size = Number(pageSize)
  const pg = Number(page)

  const total = await Session.countDocuments(filter)
  const docs = await Session.find(filter)
    .populate('userId', 'name email avatarColor status')
    .sort({ lastActiveAt: -1 })
    .skip((pg - 1) * size)
    .limit(size)
    .lean()

  const items = docs.map((d) => {
    const obj = { ...d }
    obj.id = obj._id.toString()
    delete obj._id
    delete obj.__v
    if (obj.userId && obj.userId._id) {
      obj.user = { id: obj.userId._id.toString(), name: obj.userId.name, email: obj.userId.email, avatarColor: obj.userId.avatarColor }
      obj.userId = obj.userId._id.toString()
    }
    return obj
  })

  return { items, total, page: pg, pageSize: size }
}

export async function listSessionsForUser(userId) {
  const docs = await Session.find({ userId }).sort({ lastActiveAt: -1 }).lean()
  return docs.map((d) => ({ ...d, id: d._id.toString(), _id: undefined, __v: undefined }))
}

export async function findSessionById(sessionId) {
  if (!mongoose.Types.ObjectId.isValid(sessionId) && !isUuid(sessionId)) return null
  const doc = mongoose.Types.ObjectId.isValid(sessionId)
    ? await Session.findById(sessionId)
    : await Session.findOne({ sessionId })
  return doc ? toObj(doc) : null
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value))
}

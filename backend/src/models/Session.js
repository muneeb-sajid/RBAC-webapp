import mongoose from 'mongoose'

export const SESSION_STATUS = ['ACTIVE', 'REVOKED', 'EXPIRED', 'LOGGED_OUT']

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    device: { type: String, default: 'Unknown device' },
    browser: { type: String, default: 'Unknown browser' },

    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },

    revokedAt: { type: Date, default: null },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    revokedReason: { type: String, default: null },

    status: {
      type: String,
      enum: SESSION_STATUS,
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
)

sessionSchema.index({ sessionId: 1 })
sessionSchema.index({ userId: 1 })
sessionSchema.index({ createdAt: -1 })
sessionSchema.index({ lastActiveAt: -1 })
sessionSchema.index({ status: 1 })

export default mongoose.model('Session', sessionSchema)

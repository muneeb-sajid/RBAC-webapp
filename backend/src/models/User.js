import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'],
    },
    // select: false keeps passwordHash out of all queries by default.
    // Callers that need it must explicitly add .select('+passwordHash').
    passwordHash: {
      type: String,
      select: false,
      default: null,
    },
    // Roles stored as names (strings) for the same reason as in Role.js —
    // middleware checks compare permission strings directly.
    roles: {
      type: [String],
      default: [],
    },
    directPermissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    avatarColor: {
      type: String,
      default: '#4F46E5',
    },
    // Who created this account. Null for self-registered users and the
    // very first seeded accounts.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

userSchema.index({ email: 1 })
userSchema.index({ status: 1 })
userSchema.index({ roles: 1 })
// Text index for name/email search
userSchema.index({ name: 'text', email: 'text' })

export default mongoose.model('User', userSchema)

import mongoose from 'mongoose'

// Flexible activity/audit schema. `module`/`action` are free-form strings
// (rather than a hard enum) so new modules can log activity without a
// schema migration — validation of expected values happens at the
// service layer (see services/activityService.js ACTIONS/MODULES).
const activityLogSchema = new mongoose.Schema(
  {
    // The account the activity is *about* (e.g. the user that was updated,
    // or the user who logged in). For self-actions (login, logout, viewing
    // your own profile) this equals performedBy.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    action: {
      type: String,
      required: true,
      // CREATE, READ, UPDATE, DELETE, LOGIN, LOGIN_FAILED, LOGOUT,
      // ROLE_ASSIGNED, ROLE_REMOVED, PERMISSION_ASSIGNED, PERMISSION_REVOKED,
      // SESSION_REVOKED, FORCE_LOGOUT, USER_CREATED, USER_UPDATED,
      // USER_DELETED, ROLE_CREATED, ROLE_UPDATED, ROLE_DELETED,
      // MODULE_ACCESS_CHANGED, ...
    },

    module: {
      type: String,
      required: true,
      // Users, Roles, Permissions, Sessions, Authentication, Account, ...
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },

    targetId: { type: mongoose.Schema.Types.Mixed, default: null },
    targetType: { type: String, default: null },

    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    device: { type: String, default: null },

    // Who actually performed the action. For admin actions on behalf of
    // another user (e.g. force logout) this differs from `userId`.
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
)

activityLogSchema.index({ userId: 1, createdAt: -1 })
activityLogSchema.index({ performedBy: 1, createdAt: -1 })
activityLogSchema.index({ action: 1 })
activityLogSchema.index({ module: 1 })
activityLogSchema.index({ targetId: 1 })
activityLogSchema.index({ createdAt: -1 })

export default mongoose.model('ActivityLog', activityLogSchema)

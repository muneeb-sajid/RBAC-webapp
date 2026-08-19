import mongoose from 'mongoose'

// Role stores permission names as strings (not ObjectId refs) because the
// permission system is identity-based: `users.view` is the stable contract
// consumed by middleware checks everywhere. Storing ObjectIds would require
// resolving them on every auth middleware call and break the string-based
// permission check in requirePermission().
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required.'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    permissions: {
      type: [String],
      default: [],
    },
    // System roles (Admin, Manager, ...) ship with the app and are
    // protected from deletion/renaming. Custom roles created by
    // administrators have isSystemRole: false.
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

roleSchema.index({ status: 1 })

export default mongoose.model('Role', roleSchema)

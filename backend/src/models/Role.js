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
  },
  { timestamps: true }
)

roleSchema.index({ status: 1 })

export default mongoose.model('Role', roleSchema)

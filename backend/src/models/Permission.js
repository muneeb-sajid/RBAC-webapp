import mongoose from 'mongoose'

export const MODULES = ['Users', 'Roles', 'Permissions', 'Reports', 'Settings', 'Billing', 'Security']

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+\.[a-z0-9]+$/, 'Permission name must be in format module.action, e.g. users.create.'],
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required.'],
      trim: true,
    },
    module: {
      type: String,
      required: [true, 'Module is required.'],
      enum: { values: MODULES, message: '{VALUE} is not a valid module.' },
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
  },
  { timestamps: true }
)

permissionSchema.index({ module: 1 })
permissionSchema.index({ status: 1 })

export default mongoose.model('Permission', permissionSchema)

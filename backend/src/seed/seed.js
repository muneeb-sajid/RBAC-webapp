/**
 * seed.js — Idempotent seed for MongoDB.
 *
 * Run once after first `npm start` or call programmatically:
 *   node src/seed/seed.js
 *
 * Safe to run multiple times: existing documents are NOT overwritten.
 * Uses upsert on stable unique keys (name / email / permission-name).
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Permission from '../models/Permission.js'
import Role from '../models/Role.js'
import User from '../models/User.js'
import { env } from '../config/env.js'

const SALT_ROUNDS = 10

// ─── Permission seed data ────────────────────────────────────────────────────

const SEED_PERMISSIONS = [
  { name: 'users.view',         displayName: 'View Users',         module: 'Users',       description: 'Allows viewing the users list and profiles.',                               status: 'active' },
  { name: 'users.create',       displayName: 'Create Users',       module: 'Users',       description: 'Allows creating new user accounts.',                                        status: 'active' },
  { name: 'users.update',       displayName: 'Update Users',       module: 'Users',       description: 'Allows editing existing user accounts.',                                    status: 'active' },
  { name: 'users.delete',       displayName: 'Delete Users',       module: 'Users',       description: 'Allows removing user accounts.',                                            status: 'active' },
  { name: 'roles.view',         displayName: 'View Roles',         module: 'Roles',       description: 'Allows viewing roles and their permissions.',                               status: 'active' },
  { name: 'roles.create',       displayName: 'Create Roles',       module: 'Roles',       description: 'Allows creating new roles.',                                                status: 'active' },
  { name: 'roles.update',       displayName: 'Update Roles',       module: 'Roles',       description: 'Allows editing existing roles.',                                            status: 'active' },
  { name: 'roles.delete',       displayName: 'Delete Roles',       module: 'Roles',       description: 'Allows removing roles.',                                                    status: 'active' },
  { name: 'permissions.view',   displayName: 'View Permissions',   module: 'Permissions', description: 'Allows viewing the permissions catalog.',                                   status: 'active' },
  { name: 'permissions.create', displayName: 'Create Permissions', module: 'Permissions', description: 'Allows defining new permissions.',                                          status: 'active' },
  { name: 'permissions.update', displayName: 'Update Permissions', module: 'Permissions', description: 'Allows editing permission metadata, including assigning/revoking on roles.', status: 'active' },
  { name: 'permissions.delete', displayName: 'Delete Permissions', module: 'Permissions', description: 'Allows removing permissions.',                                              status: 'active' },
  { name: 'reports.view',       displayName: 'View Reports',       module: 'Reports',     description: 'Allows viewing analytics and reports.',                                     status: 'active' },
  { name: 'reports.export',     displayName: 'Export Reports',     module: 'Reports',     description: 'Allows exporting reports to CSV/PDF.',                                      status: 'active' },
  { name: 'settings.view',      displayName: 'View Settings',      module: 'Settings',    description: 'Allows viewing system settings.',                                           status: 'active' },
  { name: 'settings.update',    displayName: 'Update Settings',    module: 'Settings',    description: 'Allows changing system settings.',                                          status: 'active' },
  { name: 'billing.view',       displayName: 'View Billing',       module: 'Billing',     description: 'Allows viewing invoices and billing history.',                              status: 'active' },
  { name: 'billing.manage',     displayName: 'Manage Billing',     module: 'Billing',     description: 'Allows updating payment methods and plans.',                                status: 'inactive' },
]

const ALL_PERMISSION_NAMES = SEED_PERMISSIONS.map((p) => p.name)

// ─── Role seed data ───────────────────────────────────────────────────────────

const SEED_ROLES = [
  {
    name: 'Admin',
    description: 'Full access to every module in the system.',
    status: 'active',
    permissions: ALL_PERMISSION_NAMES,
  },
  {
    name: 'Manager',
    description: 'Manage users and view reports, without destructive access.',
    status: 'active',
    permissions: ['users.view', 'users.create', 'users.update', 'roles.view', 'reports.view', 'reports.export'],
  },
  {
    name: 'Editor',
    description: 'Can update content-related records but cannot manage access.',
    status: 'active',
    permissions: ['users.view', 'users.update', 'reports.view'],
  },
  {
    name: 'Viewer',
    description: 'Read-only access across most modules.',
    status: 'active',
    permissions: ['users.view', 'roles.view', 'permissions.view', 'reports.view'],
  },
  {
    name: 'User',
    description: 'Default role for standard application users.',
    status: 'active',
    permissions: ['users.view'],
  },
  {
    name: 'Billing Admin',
    description: 'Manages invoices and payment settings only.',
    status: 'inactive',
    permissions: ['billing.view', 'billing.manage'],
  },
]

// ─── Signable accounts ────────────────────────────────────────────────────────

const SEED_ACCOUNTS = [
  { name: 'Admin User',    email: 'admin@example.com',   password: 'Admin123!',   roles: ['Admin'],   avatarColor: '#4F46E5' },
  { name: 'Morgan Manager', email: 'manager@example.com', password: 'Manager123!', roles: ['Manager'], avatarColor: '#059669' },
  { name: 'Vera Viewer',   email: 'viewer@example.com',  password: 'Viewer123!',  roles: ['Viewer'],  avatarColor: '#D97706' },
]

// ─── Filler users (no password — cannot log in) ───────────────────────────────

const firstNames = ['Olivia','Liam','Emma','Noah','Ava','Ethan','Sophia','Mason','Isabella','Lucas','Mia','James','Amelia','Benjamin','Harper','Elijah','Evelyn','Henry','Abigail','Alexander','Zainab','Hassan','Ayesha','Bilal','Sara','Omar','Fatima','Ali']
const lastNames  = ['Carter','Nguyen','Patel','Garcia','Kim','Rossi','Martin','Silva','Khan','Chen','Novak','Meyer','Osei','Diallo','Fischer','Suzuki','Ahmed','Malik','Farooq','Sheikh']
const avatarColors = ['#4F46E5','#059669','#D97706','#DC2626','#2563EB','#7C3AED']
const roleNames = SEED_ROLES.map((r) => r.name)

function generateFillerUsers(count) {
  const list = []
  for (let i = 0; i < count; i++) {
    const first = firstNames[i % firstNames.length]
    const last  = lastNames[(i * 3 + 1) % lastNames.length]
    const roleCount = i % 5 === 0 ? 2 : 1
    const roleIdx = i % roleNames.length
    const userRoles = [roleNames[roleIdx]]
    if (roleCount === 2) userRoles.push(roleNames[(roleIdx + 2) % roleNames.length])
    const status = i % 9 === 0 ? 'suspended' : i % 6 === 0 ? 'inactive' : 'active'
    list.push({
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@northgate.io`,
      roles: userRoles,
      directPermissions: [],
      status,
      avatarColor: avatarColors[i % avatarColors.length],
    })
  }
  return list
}

// ─── Seed runner ──────────────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to MongoDB…')
  await mongoose.connect(env.mongoUri)
  console.log('Connected. Seeding…\n')

  // Permissions
  let permInserted = 0
  for (const p of SEED_PERMISSIONS) {
    const result = await Permission.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true })
    if (result.upsertedCount) permInserted++
  }
  console.log(`Permissions: ${permInserted} inserted, ${SEED_PERMISSIONS.length - permInserted} already existed.`)

  // Roles
  let roleInserted = 0
  for (const r of SEED_ROLES) {
    const result = await Role.updateOne({ name: r.name }, { $setOnInsert: r }, { upsert: true })
    if (result.upsertedCount) roleInserted++
  }
  console.log(`Roles: ${roleInserted} inserted, ${SEED_ROLES.length - roleInserted} already existed.`)

  // Signable accounts
  let accountInserted = 0
  for (const acc of SEED_ACCOUNTS) {
    const exists = await User.findOne({ email: acc.email }).lean()
    if (!exists) {
      const passwordHash = await bcrypt.hash(acc.password, SALT_ROUNDS)
      await User.create({ ...acc, passwordHash, status: 'active' })
      accountInserted++
    }
  }
  console.log(`Seed accounts: ${accountInserted} inserted, ${SEED_ACCOUNTS.length - accountInserted} already existed.`)

  // Filler users (upsert on email — safe if already present)
  const fillerUsers = generateFillerUsers(91)
  let fillerInserted = 0
  for (const u of fillerUsers) {
    const result = await User.updateOne({ email: u.email }, { $setOnInsert: u }, { upsert: true })
    if (result.upsertedCount) fillerInserted++
  }
  console.log(`Filler users: ${fillerInserted} inserted, ${fillerUsers.length - fillerInserted} already existed.`)

  console.log('\nSeed complete.')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

import Badge from './Badge.jsx'

// Semantic color mapping for activity/audit actions, per the app's
// professional color system: create/success = green, update/neutral info =
// blue, destructive/danger = red, idle/expired = gray.
const TONE_MAP = {
  CREATE: 'success',
  USER_CREATED: 'success',
  ROLE_CREATED: 'success',
  LOGIN: 'success',

  READ: 'neutral',
  LOGOUT: 'neutral',

  UPDATE: 'info',
  USER_UPDATED: 'info',
  ROLE_UPDATED: 'info',
  ROLE_ASSIGNED: 'info',
  PERMISSION_ASSIGNED: 'info',
  MODULE_ACCESS_CHANGED: 'info',

  DELETE: 'danger',
  USER_DELETED: 'danger',
  ROLE_DELETED: 'danger',
  ROLE_REMOVED: 'danger',
  PERMISSION_REVOKED: 'danger',
  LOGIN_FAILED: 'danger',
  SESSION_REVOKED: 'danger',
  FORCE_LOGOUT: 'danger',
}

const LABEL_MAP = {
  CREATE: 'Create',
  READ: 'View',
  UPDATE: 'Update',
  DELETE: 'Delete',
  LOGIN: 'Login',
  LOGIN_FAILED: 'Login failed',
  LOGOUT: 'Logout',
  ROLE_ASSIGNED: 'Role assigned',
  ROLE_REMOVED: 'Role removed',
  PERMISSION_ASSIGNED: 'Permission assigned',
  PERMISSION_REVOKED: 'Permission revoked',
  SESSION_REVOKED: 'Session revoked',
  FORCE_LOGOUT: 'Force logout',
  USER_CREATED: 'User created',
  USER_UPDATED: 'User updated',
  USER_DELETED: 'User deleted',
  ROLE_CREATED: 'Role created',
  ROLE_UPDATED: 'Role updated',
  ROLE_DELETED: 'Role deleted',
  MODULE_ACCESS_CHANGED: 'Access changed',
}

export default function ActionBadge({ action }) {
  return <Badge tone={TONE_MAP[action] || 'neutral'}>{LABEL_MAP[action] || action}</Badge>
}

import Badge from './Badge.jsx'
import { capitalize } from '../../utils/format'

const TONE_MAP = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
  pending: 'warning',
  // Session statuses
  revoked: 'danger',
  expired: 'neutral',
  logged_out: 'neutral',
  idle: 'warning',
  // Activity/login statuses
  success: 'success',
  failed: 'danger',
}

const LABEL_MAP = {
  logged_out: 'Logged out',
}

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase()
  return (
    <Badge tone={TONE_MAP[key] || 'neutral'} dot>
      {LABEL_MAP[key] || capitalize(status || 'Unknown')}
    </Badge>
  )
}

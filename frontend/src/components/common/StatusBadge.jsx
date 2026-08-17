import Badge from './Badge.jsx'
import { capitalize } from '../../utils/format'

const TONE_MAP = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'danger',
  pending: 'warning',
}

export default function StatusBadge({ status }) {
  return (
    <Badge tone={TONE_MAP[status] || 'neutral'} dot>
      {capitalize(status || 'Unknown')}
    </Badge>
  )
}

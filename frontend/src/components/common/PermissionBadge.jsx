import { KeyRound } from 'lucide-react'
import Badge from './Badge.jsx'

export default function PermissionBadge({ permission, icon = true }) {
  return (
    <Badge tone="info" className="font-mono">
      {icon && <KeyRound size={11} />}
      {permission}
    </Badge>
  )
}

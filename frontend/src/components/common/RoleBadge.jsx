import { ShieldCheck } from 'lucide-react'
import Badge from './Badge.jsx'

export default function RoleBadge({ role, icon = true }) {
  return (
    <Badge tone="brand">
      {icon && <ShieldCheck size={11} />}
      {role}
    </Badge>
  )
}

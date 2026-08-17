import { ShieldAlert } from 'lucide-react'
import ErrorPageLayout from './ErrorPageLayout.jsx'

export default function Forbidden() {
  return (
    <ErrorPageLayout
      code="403"
      icon={ShieldAlert}
      tone="danger"
      title="Forbidden"
      description="You don't have the required permissions to view this page. Contact an administrator if you think this is a mistake."
    />
  )
}

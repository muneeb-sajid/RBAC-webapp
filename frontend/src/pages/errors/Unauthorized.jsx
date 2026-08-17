import { Lock } from 'lucide-react'
import ErrorPageLayout from './ErrorPageLayout.jsx'

export default function Unauthorized() {
  return (
    <ErrorPageLayout
      code="401"
      icon={Lock}
      tone="warning"
      title="Unauthorized"
      description="You need to sign in before you can access this page."
    />
  )
}

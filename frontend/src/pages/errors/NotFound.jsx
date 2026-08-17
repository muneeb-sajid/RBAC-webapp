import { MapPinOff } from 'lucide-react'
import ErrorPageLayout from './ErrorPageLayout.jsx'

export default function NotFound() {
  return (
    <ErrorPageLayout
      code="404"
      icon={MapPinOff}
      tone="brand"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
    />
  )
}

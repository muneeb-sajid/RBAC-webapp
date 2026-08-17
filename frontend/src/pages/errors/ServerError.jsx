import { ServerCrash } from 'lucide-react'
import ErrorPageLayout from './ErrorPageLayout.jsx'

export default function ServerError() {
  return (
    <ErrorPageLayout
      code="500"
      icon={ServerCrash}
      tone="danger"
      title="Internal server error"
      description="Something went wrong on our end. Please try again in a few moments."
    />
  )
}

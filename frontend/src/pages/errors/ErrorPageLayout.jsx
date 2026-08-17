import { Link } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'

export default function ErrorPageLayout({ code, title, description, icon: Icon, tone = 'brand' }) {
  const tints = {
    brand: 'bg-brand-50 text-brand-500',
    danger: 'bg-danger-50 text-danger-500',
    warning: 'bg-warning-50 text-warning-500',
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12 text-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tints[tone]}`}>
        <Icon size={28} />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-slate-400">Error {code}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      <div className="mt-7 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary">Back to dashboard</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Sign in</Button>
        </Link>
      </div>
    </div>
  )
}

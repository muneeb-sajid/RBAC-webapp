import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
      <Link to="/dashboard" className="flex items-center hover:text-brand-600 transition-colors">
        <Home size={13} />
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-slate-300" />
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

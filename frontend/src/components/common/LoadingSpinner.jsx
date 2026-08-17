import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 20, label, className }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${className || ''}`}>
      <Loader2 size={size} className="animate-spin text-brand-500" />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}

import Breadcrumb from './Breadcrumb.jsx'

export default function PageHeader({ title, description, breadcrumb, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  )
}

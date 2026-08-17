import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Topbar from '../components/layout/Topbar.jsx'
import Breadcrumb from '../components/common/Breadcrumb.jsx'

const ROUTE_LABELS = {
  dashboard: 'Dashboard',
  users: 'Users',
  roles: 'Roles',
  permissions: 'Permissions',
  create: 'Create',
  assign: 'Assign',
  revoke: 'Revoke',
  profile: 'Profile',
  settings: 'Settings',
  lookup: 'Lookup',
}

function useBreadcrumbItems() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  return segments.map((seg, idx) => {
    const isLast = idx === segments.length - 1
    const label = ROUTE_LABELS[seg] || (seg.length > 14 ? 'Details' : seg)
    const to = isLast ? undefined : `/${segments.slice(0, idx + 1).join('/')}`
    return { label, to }
  })
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = useBreadcrumbItems()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} breadcrumb={<Breadcrumb items={items.slice(0, -1)} />} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  UserPlus,
  UserMinus,
  UserCog,
  UserCircle,
  Settings,
  ChevronsLeft,
  ShieldHalf,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Avatar from '../common/Avatar.jsx'

const NAV_SECTIONS = [
  {
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, permission: null }],
  },
  {
    label: 'Access management',
    items: [
      { label: 'Users', to: '/users', icon: Users, permission: 'users.view' },
      { label: 'Roles', to: '/roles', icon: ShieldCheck, permission: 'roles.view' },
      { label: 'Permissions', to: '/permissions', icon: KeyRound, permission: 'permissions.view' },
    ],
  },
  {
    label: 'Permission management',
    items: [
      { label: 'Assign permissions', to: '/permissions/assign', icon: UserPlus, permission: 'permissions.update' },
      { label: 'Revoke permissions', to: '/permissions/revoke', icon: UserMinus, permission: 'permissions.update' },
      { label: 'User permissions', to: '/users/lookup/permissions', icon: UserCog, permission: 'users.view' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', to: '/profile', icon: UserCircle, permission: null },
      { label: 'Settings', to: '/settings', icon: Settings, permission: null },
    ],
  },
]

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { user, hasPermission } = useAuth()

  const content = (
    <div className="flex h-full flex-col bg-ink-950 text-slate-300">
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
            <ShieldHalf size={17} />
          </div>
          {!collapsed && <span className="whitespace-nowrap text-[15px] font-bold tracking-tight text-white">Sentinel</span>}
        </div>
        <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 lg:hidden" aria-label="Close menu">
          <X size={18} />
        </button>
        <button
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/5 lg:flex"
          aria-label="Collapse sidebar"
        >
          <ChevronsLeft size={16} className={clsx('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
        {NAV_SECTIONS.map((section, idx) => {
          const visibleItems = section.items.filter((item) => !item.permission || hasPermission(item.permission))
          if (visibleItems.length === 0) return null
          return (
            <div key={idx} className="mb-1 mt-4 first:mt-0">
              {section.label && !collapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{section.label}</p>
              )}
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive ? 'bg-brand-500/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={17} className={clsx('shrink-0', isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300')} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
          <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.roles?.[0]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className={clsx('hidden shrink-0 border-r border-white/5 transition-all duration-200 lg:block', collapsed ? 'w-[76px]' : 'w-64')}>
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={clsx(
          'fixed inset-0 z-40 lg:hidden transition-opacity',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="absolute inset-0 bg-ink-950/60" onClick={onCloseMobile} />
        <aside className={clsx('absolute inset-y-0 left-0 w-72 transition-transform duration-200', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
          {content}
        </aside>
      </div>
    </>
  )
}

import { useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, Sun, Moon, LogOut, UserCircle, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import Avatar from '../common/Avatar.jsx'
import Dropdown from '../common/Dropdown.jsx'
import Breadcrumb from '../common/Breadcrumb.jsx'

export default function Topbar({ onOpenMobileMenu, breadcrumb }) {
  const { user, logout } = useAuth()
  const toast = useToast()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-surface-border bg-white/90 px-4 backdrop-blur sm:px-6">
      <button onClick={onOpenMobileMenu} className="rounded-lg p-2 text-slate-500 hover:bg-surface-muted lg:hidden" aria-label="Open menu">
        <Menu size={19} />
      </button>

      <div className="hidden lg:block">{breadcrumb}</div>

      <div className="relative ml-auto hidden max-w-sm flex-1 sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search users, roles, permissions…"
          className="h-9 w-full rounded-lg border border-surface-border bg-surface-muted/70 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:outline-none transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-surface-muted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-surface-muted transition-colors" aria-label="Notifications">
          <Bell size={17} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger-500" />
        </button>

        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-surface-muted transition-colors">
              <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>
          }
          items={[
            { label: 'Profile', icon: UserCircle, onClick: () => navigate('/profile') },
            { label: 'Settings', icon: Settings, onClick: () => navigate('/settings') },
            { divider: true },
            { label: 'Log out', icon: LogOut, danger: true, onClick: handleLogout },
          ]}
        />
      </div>
    </header>
  )
}

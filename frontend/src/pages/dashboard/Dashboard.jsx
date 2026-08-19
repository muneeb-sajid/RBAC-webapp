import { useEffect, useState } from 'react'
import { Users, ShieldCheck, KeyRound, UserCheck, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import RoleBadge from '../../components/common/RoleBadge.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  dashboardStats,
  usersByRole,
  permissionsByModule,
  recentActivity,
  weeklyActiveTrend,
  users,
} from '../../data/mockData'
import { timeAgo } from '../../utils/format'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, []);
  const maxRole = Math.max(...usersByRole.map((r) => r.count), 1)
  const maxModule = Math.max(...permissionsByModule.map((m) => m.count), 1)
  const maxTrend = Math.max(...weeklyActiveTrend.map((d) => d.value), 1)
  const recentUsers = [...users].slice(0, 5)
    if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={26} label="Loading dashboard…" />
      
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
        description="Here's the current state of your access control system."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={dashboardStats.totalUsers} trend={dashboardStats.trends.users} icon={Users} tint="brand" />
        <StatCard label="Total Roles" value={dashboardStats.totalRoles} trend={dashboardStats.trends.roles} icon={ShieldCheck} tint="info" />
        <StatCard label="Total Permissions" value={dashboardStats.totalPermissions} trend={dashboardStats.trends.permissions} icon={KeyRound} tint="warning" />
        <StatCard label="Active Users" value={dashboardStats.activeUsers} trend={dashboardStats.trends.activeUsers} icon={UserCheck} tint="success" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Weekly active trend */}
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly active users" description="Sessions across the last 7 days" />
          <div className="flex h-48 items-end gap-3 sm:gap-5 px-1">
            {weeklyActiveTrend.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    className="w-full max-w-[36px] rounded-t-md bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500"
                    style={{ height: `${(d.value / maxTrend) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Users by role */}
        <Card>
          <CardHeader title="Users by role" description="Distribution across active roles" />
          <div className="flex flex-col gap-3.5">
            {usersByRole.map((r) => (
              <div key={r.role}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-900">{r.role}</span>
                  <span className="text-slate-500">{r.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${(r.count / maxRole) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Permissions by module */}
        <Card>
          <CardHeader title="Permissions by module" description="Catalog coverage per module" />
          <div className="flex flex-col gap-3.5">
            {permissionsByModule.map((m) => (
              <div key={m.module}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-900">{m.module}</span>
                  <span className="text-slate-500">{m.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-info-500 transition-all duration-500"
                    style={{ width: `${(m.count / maxModule) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent users */}
        <Card>
          <CardHeader
            title="Recent users"
            action={
              <Link to="/users" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                View all <ArrowUpRight size={12} />
              </Link>
            }
          />
          <div className="flex flex-col gap-3.5">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar name={u.name} color={u.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{u.name}</p>
                  <p className="truncate text-xs text-slate-500">{u.email}</p>
                </div>
                <RoleBadge role={u.roles[0]} icon={false} />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader title="Recent activity" description="Latest changes across the system" />
          <div className="flex flex-col gap-4">
            {recentActivity.slice(0, 5).map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <div className="min-w-0">
                  <p className="text-xs leading-relaxed text-slate-600">
                    <span className="font-semibold text-ink-900">{a.actor}</span> {a.action}{' '}
                    <span className="font-medium text-ink-900">{a.target}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

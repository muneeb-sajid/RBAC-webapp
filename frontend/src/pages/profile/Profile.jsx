import { useState } from 'react'
import { Camera, Mail, Calendar, Clock, Lock, Save } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import RoleBadge from '../../components/common/RoleBadge.jsx'
import Tabs from '../../components/common/Tabs.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { formatDate, formatDateTime } from '../../utils/format'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('general')

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleProfileSave(e) {
    e.preventDefault()
    setSavingProfile(true)
    await new Promise((r) => setTimeout(r, 500))
    updateUser(profileForm)
    toast.success('Profile updated')
    setSavingProfile(false)
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    const errors = {}
    if (!passwordForm.current) errors.current = 'Enter your current password.'
    if (passwordForm.next.length < 8) errors.next = 'Must be at least 8 characters.'
    if (passwordForm.confirm !== passwordForm.next) errors.confirm = 'Passwords do not match.'
    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSavingPassword(true)
    await new Promise((r) => setTimeout(r, 500))
    toast.success('Password updated')
    setPasswordForm({ current: '', next: '', confirm: '' })
    setSavingPassword(false)
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account information and security settings." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar name={user?.name} color={user?.avatarColor} size="xl" />
              <button
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                aria-label="Change avatar"
                onClick={() => toast.info('Avatar upload is a UI placeholder in this demo.')}
              >
                <Camera size={12} />
              </button>
            </div>
            <h2 className="mt-3 text-base font-semibold text-ink-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {user?.roles?.map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-surface-border pt-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Mail size={14} /> Email
              </span>
              <span className="text-ink-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status</span>
              <StatusBadge status="active" />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Calendar size={14} /> Created
              </span>
              <span className="text-ink-900">{formatDate(user?.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Clock size={14} /> Last login
              </span>
              <span className="text-ink-900">{formatDateTime(user?.lastLogin)}</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" padded={false}>
          <div className="px-5 pt-4">
            <Tabs
              tabs={[
                { value: 'general', label: 'General' },
                { value: 'security', label: 'Security' },
              ]}
              active={tab}
              onChange={setTab}
            />
          </div>

          {tab === 'general' && (
            <form onSubmit={handleProfileSave} className="p-5">
              <CardHeader title="Personal information" description="Update your name and contact email." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="mt-5 flex justify-end">
                <Button type="submit" icon={Save} loading={savingProfile}>
                  Save changes
                </Button>
              </div>
            </form>
          )}

          {tab === 'security' && (
            <form onSubmit={handlePasswordSave} className="p-5">
              <CardHeader title="Change password" description="Choose a strong password you don't use elsewhere." />
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Current password"
                  type="password"
                  icon={Lock}
                  value={passwordForm.current}
                  error={passwordErrors.current}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="New password"
                    type="password"
                    icon={Lock}
                    value={passwordForm.next}
                    error={passwordErrors.next}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
                    required
                  />
                  <Input
                    label="Confirm new password"
                    type="password"
                    icon={Lock}
                    value={passwordForm.confirm}
                    error={passwordErrors.confirm}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <Button type="submit" icon={Save} loading={savingPassword}>
                  Update password
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

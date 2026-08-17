import { Moon, Sun, Bell, Globe, Save } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const toast = useToast()
  const [notifications, setNotifications] = useState({ email: true, product: false, security: true })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    toast.success('Settings saved')
    setSaving(false)
  }

  return (
    <div>
      <PageHeader title="Settings" description="Configure appearance and notification preferences." />

      <div className="flex flex-col gap-5 max-w-2xl">
        <Card>
          <CardHeader title="Appearance" description="Choose how Sentinel looks on this device." />
          <div className="flex gap-3">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-colors ${
                  theme === opt.value ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-surface-border text-slate-600 hover:bg-surface-muted'
                }`}
              >
                <opt.icon size={18} />
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Notifications" description="Choose what you want to be notified about." />
          <div className="flex flex-col gap-4">
            {[
              { key: 'email', label: 'Email notifications', description: 'Receive updates about account activity via email.' },
              { key: 'product', label: 'Product updates', description: 'New features and announcements from Sentinel.' },
              { key: 'security', label: 'Security alerts', description: 'Get notified about sign-ins from new devices.' },
            ].map((item) => (
              <label key={item.key} className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-ink-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications((n) => ({ ...n, [item.key]: e.target.checked }))}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-surface-border text-brand-500 focus:ring-brand-300"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Regional" description="Language and timezone preferences." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Language" options={[{ value: 'en', label: 'English (US)' }]} value="en" onChange={() => {}} />
            <Select label="Timezone" options={[{ value: 'utc', label: 'UTC' }]} value="utc" onChange={() => {}} />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button icon={Save} onClick={handleSave} loading={saving}>
            Save settings
          </Button>
        </div>
      </div>
    </div>
  )
}

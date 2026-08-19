import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Tabs from '../../components/common/Tabs.jsx'
import usePermission from '../../hooks/usePermission'
import LoginActivityTab from './LoginActivityTab.jsx'
import ActiveSessionsTab from './ActiveSessionsTab.jsx'
import AuditLogTab from './AuditLogTab.jsx'

const ALL_TABS = [
  { value: 'login-activity', label: 'Login activity', permission: 'activity.view' },
  { value: 'sessions', label: 'Active sessions', permission: 'sessions.view' },
  { value: 'audit', label: 'Audit logs', permission: 'activity.view' },
]

export default function Security() {
  const { can } = usePermission()
  const tabs = ALL_TABS.filter((t) => can(t.permission))
  const [active, setActive] = useState(tabs[0]?.value)

  const current = active || tabs[0]?.value

  return (
    <div>
      <PageHeader
        title="Security"
        description="Login activity, active sessions, and the full administrative audit trail."
      />

      <Tabs tabs={tabs} active={current} onChange={setActive} />

      <div className="mt-5">
        {current === 'login-activity' && <LoginActivityTab />}
        {current === 'sessions' && <ActiveSessionsTab />}
        {current === 'audit' && <AuditLogTab />}
      </div>
    </div>
  )
}

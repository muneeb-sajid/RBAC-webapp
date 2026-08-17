// src/pages/users/UserCreate.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, User } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { createUser } from '../../services/user.js'
import { getAllRoles } from '../../services/role.js'
import { isValidEmail } from '../../utils/validators'

export default function UserCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    roles: [], 
    status: 'active' 
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState([])  // ✅ State for roles from API
  const [loadingRoles, setLoadingRoles] = useState(true)  // ✅ Loading state

  // ✅ Fetch roles from API
  useEffect(() => {
    const loadRoles = async () => {
      setLoadingRoles(true)
      try {
        const result = await getAllRoles()
        console.log('📊 Roles loaded for user creation:', result)
        
        // Handle different response formats
        let rolesArray = []
        if (Array.isArray(result)) {
          rolesArray = result
        } else if (result && result.roles && Array.isArray(result.roles)) {
          rolesArray = result.roles
        } else if (result && result.items && Array.isArray(result.items)) {
          rolesArray = result.items
        } else {
          rolesArray = []
        }
        
        setRoles(rolesArray)
      } catch (error) {
        console.error('❌ Error loading roles:', error)
        toast.error('Failed to load roles')
      } finally {
        setLoadingRoles(false)
      }
    }
    
    loadRoles()
  }, [])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleRole(name) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(name) ? f.roles.filter((r) => r !== name) : [...f.roles, name],
    }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email) next.email = 'Email is required.'
    else if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    else if (form.password.length < 8) next.password = 'Must be at least 8 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    if (form.roles.length === 0) next.roles = 'Select at least one role.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      // ✅ Send data in the format backend expects
      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        roles: form.roles,
        status: form.status
      }
      
      const user = await createUser(userData)
      toast.success('User created', { description: `${user.name} has been added.` })
      navigate(`/users/${user.id}`)
    } catch (error) {
      console.error('❌ Error creating user:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Add user"
        description="Create a new user account and assign initial roles."
        breadcrumb={[{ label: 'Users', to: '/users' }, { label: 'Create' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              icon={User}
              placeholder="Jordan Reyes"
              value={form.name}
              error={errors.name}
              onChange={(e) => set('name', e.target.value)}
              required
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="jordan@company.com"
              value={form.email}
              error={errors.email}
              onChange={(e) => set('email', e.target.value)}
              required
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => set('password', e.target.value)}
              required
            />
            <Input
              label="Confirm password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              required
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
              containerClassName="sm:col-span-2"
            />
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-ink-900">
              Role(s) <span className="text-danger-500">*</span>
              {loadingRoles && <span className="ml-2 text-sm text-slate-400">Loading...</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.map((r) => (
                <label
                  key={r.id || r.name}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    form.roles.includes(r.name) 
                      ? 'border-brand-400 bg-brand-50 text-brand-700' 
                      : 'border-surface-border text-slate-600 hover:bg-surface-muted'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={form.roles.includes(r.name)} 
                    onChange={() => toggleRole(r.name)} 
                    className="h-3.5 w-3.5 rounded text-brand-500" 
                  />
                  {r.name}
                </label>
              ))}
              {!loadingRoles && roles.length === 0 && (
                <p className="text-sm text-slate-400">No roles available. Please create a role first.</p>
              )}
            </div>
            {errors.roles && <p className="mt-1.5 text-xs font-medium text-danger-600">{errors.roles}</p>}
          </div>
        </Card>

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create user
          </Button>
        </div>
      </form>
    </div>
  )
}
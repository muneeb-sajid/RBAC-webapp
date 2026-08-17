import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ShieldHalf, AlertCircle } from 'lucide-react'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { isValidEmail, passwordStrength } from '../../utils/validators'

const ROLE_OPTIONS = [
  { value: 'User', label: 'User' },
  { value: 'Viewer', label: 'Viewer' },
  { value: 'Editor', label: 'Editor' },
  { value: 'Manager', label: 'Manager' },
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'User' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const strength = passwordStrength(form.password)

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email) next.email = 'Email is required.'
    else if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully', { description: 'Welcome to Sentinel.' })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.message || 'Unable to create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
            <ShieldHalf size={19} />
          </div>
          <span className="text-lg font-bold tracking-tight text-ink-900">Sentinel</span>
        </div>

        <div className="rounded-2xl border border-surface-border bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">Get started with the RBAC admin panel.</p>

          {apiError && (
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger-200 bg-danger-50 px-3.5 py-3 text-sm text-danger-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Full name"
              icon={User}
              placeholder="Jordan Reyes"
              value={form.name}
              error={errors.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              value={form.email}
              error={errors.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <Select
              label="Role"
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              hint="You can change this later from the Roles page."
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={form.password}
                error={errors.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                iconRight={
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
              />
              {form.password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{strength.label}</p>
                </div>
              )}
            </div>
            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              required
            />

            <Button type="submit" size="lg" className="w-full mt-1" loading={loading}>
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

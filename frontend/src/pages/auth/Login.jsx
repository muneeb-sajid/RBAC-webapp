import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ShieldHalf, AlertCircle } from 'lucide-react'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { isValidEmail } from '../../utils/validators'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  function validate() {
    const next = {}
    if (!form.email) next.email = 'Email is required.'
    else if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(79,70,229,0.2),transparent_40%)]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
            <ShieldHalf size={19} />
          </div>
          <span className="text-lg font-bold tracking-tight">Sentinel</span>
        </div>
        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight">Control Access. Protect What Matters.</h2>
          <p className="mt-4 max-w-sm text-sm text-slate-400">
            Secure your enterprise with centralized role-based access, controlled permissions, and reliable user management.
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm text-slate-400">
            <div>
              <p className="text-xl font-bold text-white">1,248</p>
              <p>Users managed</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold text-white">99.98%</p>
              <p>Uptime</p>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Sentinel Systems. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
              <ShieldHalf size={19} />
            </div>
            <span className="text-lg font-bold tracking-tight text-ink-900">Sentinel</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">Enter your credentials to access the admin panel.</p>

         ``
          {apiError && (
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger-200 bg-danger-50 px-3.5 py-3 text-sm text-danger-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                  className="h-4 w-4 rounded border-surface-border text-brand-500 focus:ring-brand-300"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

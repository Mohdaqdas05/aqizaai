import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Chrome } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login, loginWithGoogle } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      addToast('Please fill in all fields.', 'warning')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Login failed. Please check your credentials.'
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            A
          </div>
          <h1 className="text-2xl font-bold text-txt-primary">Welcome back</h1>
          <p className="text-txt-secondary text-sm mt-1">Sign in to your AQIZA AI account</p>
        </div>

        {/* Google */}
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-hover text-txt-primary text-sm font-medium transition-colors mb-4"
        >
          <Chrome className="w-4 h-4" />
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-txt-muted">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-input border border-border text-txt-primary placeholder-txt-muted text-sm outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-txt-secondary">
                Password
              </label>
              <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-surface-input border border-border text-txt-primary placeholder-txt-muted text-sm outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mt-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-txt-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

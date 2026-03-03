import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Chrome, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score // 0-4
}

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, loginWithGoogle } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const strength = password ? getPasswordStrength(password) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      addToast('Please fill in all fields.', 'warning')
      return
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters.', 'warning')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed. Please try again.'
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            A
          </div>
          <h1 className="text-2xl font-bold text-txt-primary">Create account</h1>
          <p className="text-txt-secondary text-sm mt-1">Join AQIZA AI for free</p>
        </div>

        {/* Google */}
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-hover text-txt-primary text-sm font-medium transition-colors mb-4"
        >
          <Chrome className="w-4 h-4" />
          Sign up with Google
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
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-input border border-border text-txt-primary placeholder-txt-muted text-sm outline-none focus:border-brand-500 transition-colors"
            />
          </div>

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
            <label className="block text-sm font-medium text-txt-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
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

            {/* Strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength ? strengthColor[strength] : 'bg-surface-hover'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-txt-muted">{strengthLabel[strength]}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mt-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-txt-muted mt-4">
          By signing up, you agree to our{' '}
          <a href="#" className="text-brand-400 hover:text-brand-300">Terms</a> and{' '}
          <a href="#" className="text-brand-400 hover:text-brand-300">Privacy Policy</a>.
        </p>

        <p className="text-center text-sm text-txt-secondary mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

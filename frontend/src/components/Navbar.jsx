import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-txt-primary text-lg tracking-tight">
            AQIZA AI
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-txt-secondary hover:text-txt-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-txt-secondary hover:text-txt-primary transition-colors"
          >
            Pricing
          </a>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
              pathname === '/login'
                ? 'text-brand-400'
                : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  )
}

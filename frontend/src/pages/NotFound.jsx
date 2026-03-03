import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-bold text-brand-500/20 mb-4 select-none">404</div>
      <h1 className="text-2xl font-bold text-txt-primary mb-2">Page not found</h1>
      <p className="text-txt-secondary mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}

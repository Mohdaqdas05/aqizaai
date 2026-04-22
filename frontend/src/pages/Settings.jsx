import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sun, Moon, Trash2, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLocalStorage } from '../hooks/useLocalStorage'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-txt-muted uppercase tracking-wider mb-3 px-1">
        {title}
      </h2>
      <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({ label, description, children, danger }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0 ${
        danger ? 'bg-red-900/10' : ''
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-txt-primary'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-txt-muted mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useLocalStorage('dark_mode', true)
  const [name, setName] = useState(user?.name || '')
  const [editingName, setEditingName] = useState(false)
  const [nameBeforeEdit, setNameBeforeEdit] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const avatarLetter =
    user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

  const handleDarkModeToggle = () => {
    setDarkMode((v) => !v)
    document.documentElement.classList.toggle('dark', !darkMode)
  }

  return (
    <div className="min-h-screen bg-surface text-txt-primary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-semibold text-txt-primary">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile section */}
        <Section title="Profile">
          <Row
            label="Avatar"
            description="Your display initial"
          >
            <div className="w-10 h-10 rounded-full bg-brand-500/80 flex items-center justify-center text-white font-semibold text-sm">
              {avatarLetter}
            </div>
          </Row>
          <Row
            label="Display Name"
            description={editingName ? undefined : (name || 'Not set')}
          >
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-surface-input border border-border text-txt-primary text-sm outline-none focus:border-brand-500 transition-colors w-40"
                  autoFocus
                />
                <button
                  onClick={() => setEditingName(false)}
                  className="px-3 py-1.5 rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-medium cursor-not-allowed"
                  disabled
                  title="Name saving is not yet available"
                >
                  Save
                </button>
                <button
                  onClick={() => { setName(nameBeforeEdit); setEditingName(false) }}
                  className="p-1.5 rounded-lg text-txt-muted hover:text-txt-secondary hover:bg-surface-hover transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNameBeforeEdit(name); setEditingName(true) }}
                className="px-3 py-1.5 rounded-lg border border-border hover:border-brand-500/40 text-txt-secondary hover:text-txt-primary text-xs font-medium transition-colors"
              >
                Edit
              </button>
            )}
          </Row>
        </Section>

        {/* Appearance section */}
        <Section title="Appearance">
          <Row
            label="Dark Mode"
            description="Toggle between dark and light theme"
          >
            <button
              onClick={handleDarkModeToggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-brand-500' : 'bg-surface-hover border border-border'
              }`}
              aria-label="Toggle dark mode"
              role="switch"
              aria-checked={darkMode}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </Row>
          <Row
            label="Theme"
            description={`Currently: ${darkMode ? 'Dark' : 'Light'} mode`}
          >
            <div className="flex items-center gap-1.5">
              {darkMode ? (
                <Moon className="w-4 h-4 text-brand-400" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-xs text-txt-secondary">
                {darkMode ? 'Dark' : 'Light'}
              </span>
            </div>
          </Row>
        </Section>

        {/* Account section */}
        <Section title="Account">
          <Row
            label="Email"
            description={user?.email || 'Not available'}
          >
            <span className="text-xs text-txt-muted bg-surface-hover px-2.5 py-1 rounded-full border border-border">
              {user?.googleId ? 'Google' : 'Email'}
            </span>
          </Row>
          <Row
            label="Google Account"
            description={
              user?.googleId
                ? 'Your account is linked to Google'
                : 'Not linked to Google'
            }
          >
            <span
              className={`text-xs px-2.5 py-1 rounded-full border ${
                user?.googleId
                  ? 'text-green-400 bg-green-400/10 border-green-400/20'
                  : 'text-txt-muted bg-surface-hover border-border'
              }`}
            >
              {user?.googleId ? 'Linked' : 'Not linked'}
            </span>
          </Row>
          <Row label="Plan" description="Your current subscription">
            <span className="text-xs text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
              Free
            </span>
          </Row>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <Row
            label="Delete Account"
            description="Permanently delete your account and all data. This cannot be undone."
            danger
          >
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </Row>
        </Section>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm bg-surface-card border border-border rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-txt-primary">Delete Account</h3>
                  <p className="text-xs text-txt-muted">This action is irreversible</p>
                </div>
              </div>
              <p className="text-sm text-txt-secondary mb-6 leading-relaxed">
                Are you sure you want to permanently delete your account? All your
                conversations and data will be lost forever.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 rounded-xl border border-border text-txt-secondary hover:text-txt-primary hover:bg-surface-hover text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled
                  className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400/50 text-sm font-medium cursor-not-allowed border border-red-500/20"
                  title="Account deletion is not yet available"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  User,
  CreditCard,
  Shield,
  Database,
  Check,
  X,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import api from '../api/axios'

// ── Helpers ───────────────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      aria-pressed={enabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${enabled ? 'bg-brand-500' : 'bg-surface-hover border border-border'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="mr-6">
        <p className="text-sm font-medium text-txt-primary">{label}</p>
        {description && (
          <p className="text-xs text-txt-secondary mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-txt-primary">{title}</h2>
        </div>
      )}
      <div className="divide-y divide-border px-6">{children}</div>
    </div>
  )
}

function ComingSoonBadge() {
  return (
    <span className="ml-2 text-xs bg-surface-hover text-txt-secondary border border-border rounded-full px-2 py-0.5">
      Soon
    </span>
  )
}

function ConfirmModal({ title, message, confirmText, onConfirm, onCancel, destructive, requireType }) {
  const [typed, setTyped] = useState('')
  const ready = !requireType || typed === requireType

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-start gap-3 mb-4">
          {destructive && (
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-txt-primary text-lg">{title}</h3>
            <p className="text-sm text-txt-secondary mt-1">{message}</p>
          </div>
        </div>

        {requireType && (
          <div className="mb-4">
            <p className="text-xs text-txt-secondary mb-1.5">
              Type <strong className="text-txt-primary">{requireType}</strong> to confirm
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full bg-surface-input border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-brand-500"
              placeholder={requireType}
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-txt-secondary hover:text-txt-primary border border-border rounded-lg hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!ready}
            className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
              destructive
                ? 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                : 'bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Section components ────────────────────────────────────────────────────────

function GeneralSection({ user, updateUser, addToast }) {
  const [theme, setTheme] = useState(user?.theme || 'dark')
  const [language, setLanguage] = useState(user?.language || 'en')
  const [preferredModel, setPreferredModel] = useLocalStorage('preferred_model', '')
  const [models, setModels] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/models').then((res) => {
      const list = res.data?.models || res.data?.data?.models || []
      setModels(list)
    }).catch(() => {})
  }, [])

  const applyTheme = (t) => {
    if (t === 'dark') document.documentElement.classList.add('dark')
    else if (t === 'light') document.documentElement.classList.remove('dark')
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }

  const handleThemeChange = async (val) => {
    setTheme(val)
    applyTheme(val)
    setSaving(true)
    try {
      const res = await api.put('/auth/settings', { theme: val })
      updateUser(res.data.data)
      addToast('Theme updated', 'success')
    } catch {
      addToast('Failed to save theme', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLanguageSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/auth/settings', { language })
      updateUser(res.data.data)
      addToast('Language saved', 'success')
    } catch {
      addToast('Failed to save language', 'error')
    } finally {
      setSaving(false)
    }
  }

  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'Arabic' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' },
    { code: 'de', label: 'German' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'ko', label: 'Korean' },
  ]

  const THEMES = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Appearance">
        <SettingRow label="Theme" description="Choose your preferred color scheme">
          <div className="flex gap-2">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                disabled={saving}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  theme === value
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-border text-txt-secondary hover:text-txt-primary hover:border-txt-muted'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Language & Region">
        <SettingRow label="Language" description="Select the interface language">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-surface-input border border-border rounded-lg px-3 py-2 pr-8 text-sm text-txt-primary focus:outline-none focus:border-brand-500"
              >
                {LANGUAGES.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary pointer-events-none" />
            </div>
            <button
              onClick={handleLanguageSave}
              disabled={saving}
              className="px-3 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Default Model">
        <SettingRow label="Preferred model" description="Starting model for new chats (saved locally)">
          <div className="relative">
            <select
              value={preferredModel}
              onChange={(e) => setPreferredModel(e.target.value)}
              className="appearance-none bg-surface-input border border-border rounded-lg px-3 py-2 pr-8 text-sm text-txt-primary focus:outline-none focus:border-brand-500"
            >
              <option value="">Use default</option>
              {models.map((m) => (
                <option key={m.id || m} value={m.id || m}>{m.name || m.id || m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary pointer-events-none" />
          </div>
        </SettingRow>
      </SectionCard>
    </div>
  )
}

function PersonalizationSection({ user, updateUser, addToast }) {
  const [memoryEnabled, setMemoryEnabled] = useState(user?.memory_enabled ?? true)
  const [customInstructions, setCustomInstructions] = useLocalStorage('custom_instructions', '')
  const [showCodeLang, setShowCodeLang] = useLocalStorage('show_code_lang', true)
  const [saving, setSaving] = useState(false)

  const handleMemoryToggle = async () => {
    const next = !memoryEnabled
    setMemoryEnabled(next)
    setSaving(true)
    try {
      const res = await api.put('/auth/settings', { memory_enabled: next })
      updateUser(res.data.data)
      addToast(`Memory ${next ? 'enabled' : 'disabled'}`, 'success')
    } catch {
      setMemoryEnabled(!next)
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Memory">
        <SettingRow
          label="Memory"
          description={
            memoryEnabled
              ? 'AQIZA AI will remember things from your conversations to give better responses.'
              : 'Memory is disabled. Conversations are not remembered.'
          }
        >
          <Toggle enabled={memoryEnabled} onToggle={handleMemoryToggle} disabled={saving} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Custom Instructions">
        <div className="py-4">
          <p className="text-sm font-medium text-txt-primary mb-1">
            What would you like AQIZA AI to know about you?
          </p>
          <p className="text-xs text-txt-secondary mb-3">
            This context is saved locally and included in new conversations.
          </p>
          <textarea
            value={customInstructions}
            onChange={(e) => {
              if (e.target.value.length <= 1500) setCustomInstructions(e.target.value)
            }}
            rows={5}
            placeholder="e.g. I am a software engineer. Always respond in concise bullet points."
            className="w-full bg-surface-input border border-border rounded-xl px-4 py-3 text-sm text-txt-primary placeholder-txt-muted focus:outline-none focus:border-brand-500 resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${customInstructions.length > 1400 ? 'text-red-400' : 'text-txt-muted'}`}>
              {customInstructions.length}/1500
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Display">
        <SettingRow
          label="Always show code block language"
          description="Show the programming language label on every code block"
        >
          <Toggle enabled={showCodeLang} onToggle={() => setShowCodeLang((v) => !v)} />
        </SettingRow>
      </SectionCard>
    </div>
  )
}

function NotificationsSection({ user, updateUser, addToast }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notifications_enabled ?? true
  )
  const [saving, setSaving] = useState(false)

  const handleToggle = async () => {
    const next = !notificationsEnabled
    setNotificationsEnabled(next)
    setSaving(true)
    try {
      const res = await api.put('/auth/settings', { notifications_enabled: next })
      updateUser(res.data.data)
      addToast(`Notifications ${next ? 'enabled' : 'disabled'}`, 'success')
    } catch {
      setNotificationsEnabled(!next)
      addToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard title="Email Notifications">
      <SettingRow
        label="Email notifications"
        description="Receive updates about new features and tips."
      >
        <Toggle enabled={notificationsEnabled} onToggle={handleToggle} disabled={saving} />
      </SettingRow>
    </SectionCard>
  )
}

function ProfileSection({ user, updateUser, addToast }) {
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const avatarLetter = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()

  const handleSaveName = async () => {
    if (!name.trim()) return
    setSavingName(true)
    try {
      const res = await api.put('/auth/profile', { name })
      updateUser(res.data.data)
      addToast('Name updated', 'success')
    } catch {
      addToast('Failed to update name', 'error')
    } finally {
      setSavingName(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error')
      return
    }
    setSavingPwd(true)
    try {
      await api.put('/auth/profile', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      addToast('Password changed', 'success')
    } catch (err) {
      addToast(err?.response?.data?.error || 'Failed to change password', 'error')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Avatar">
        <div className="py-6 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
            {avatarLetter}
          </div>
          <div className="relative group">
            <button
              disabled
              className="text-sm text-txt-secondary border border-border rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
            >
              Change photo
            </button>
            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 text-xs bg-surface-card border border-border text-txt-secondary px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Coming soon
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Personal Info">
        <SettingRow label="Full name" description="Your display name across AQIZA AI">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-surface-input border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-brand-500 w-44"
            />
            <button
              onClick={handleSaveName}
              disabled={savingName || !name.trim()}
              className="px-3 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </SettingRow>
        <SettingRow label="Email" description="Your login email">
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-secondary">{user?.email}</span>
            <span className="text-xs bg-surface-hover border border-border text-txt-secondary rounded-full px-2 py-0.5">
              {user?.google_id ? 'Google' : 'Email'}
            </span>
          </div>
        </SettingRow>
      </SectionCard>

      {!user?.google_id && (
        <SectionCard title="Change Password">
          <div className="py-4 flex flex-col gap-3">
            <div>
              <label className="text-xs text-txt-secondary mb-1 block">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-surface-input border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs text-txt-secondary mb-1 block">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-input border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs text-txt-secondary mb-1 block">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-input border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={savingPwd || !currentPassword || !newPassword || !confirmPassword}
              className="self-end px-4 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {savingPwd ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function PlansSection({ user }) {
  const PLAN_CONFIG = {
    free:  { label: 'Free',  color: 'text-txt-secondary bg-surface-hover border-border' },
    plus:  { label: 'Plus',  color: 'text-purple-300 bg-purple-500/10 border-purple-500/30' },
    pro:   { label: 'Pro',   color: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30' },
  }
  const plan = user?.plan || 'free'
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.free

  const FEATURES = [
    { name: 'Access to 3 free models', free: true, plus: true, pro: true },
    { name: 'Unlimited chats',         free: true, plus: true, pro: true },
    { name: 'Chat history',            free: true, plus: true, pro: true },
    { name: 'GPT-4 class models',      free: false, plus: true, pro: true },
    { name: 'Priority access',         free: false, plus: false, pro: true },
    { name: 'API access',              free: false, plus: false, pro: true },
  ]

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Current Plan">
        <div className="py-6 flex flex-col items-center gap-3">
          <span className={`text-sm font-semibold border rounded-full px-4 py-1.5 ${config.color}`}>
            {config.label} Plan
          </span>
          <p className="text-xs text-txt-secondary">
            {plan === 'free' ? 'Upgrade to unlock more powerful models and features.' : 'Thank you for supporting AQIZA AI!'}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Feature Comparison">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 text-left text-txt-secondary font-medium">Feature</th>
              {['Free', 'Plus', 'Pro'].map((p) => (
                <th key={p} className="py-3 text-center text-txt-secondary font-medium">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map(({ name, free, plus, pro }) => (
              <tr key={name} className="border-b border-border last:border-0">
                <td className="py-3 text-txt-primary">{name}</td>
                {[free, plus, pro].map((v, i) => (
                  <td key={i} className="py-3 text-center">
                    {v
                      ? <Check className="w-4 h-4 text-brand-400 mx-auto" />
                      : <X className="w-4 h-4 text-txt-muted mx-auto" />
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="py-4 flex gap-3 justify-center">
          {['Plus', 'Pro'].map((p) => (
            <div key={p} className="relative group">
              <button
                disabled
                className="px-5 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white opacity-50 cursor-not-allowed"
              >
                Upgrade to {p}
              </button>
              <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 text-xs bg-surface-card border border-border text-txt-secondary px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function SecuritySection({ user, addToast }) {
  const [logOutLoading, setLogOutLoading] = useState(false)

  const handleLogOutOthers = async () => {
    setLogOutLoading(true)
    try {
      await api.delete('/auth/sessions').catch(() => {})
      addToast('Other sessions logged out', 'success')
    } finally {
      setLogOutLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Active Sessions">
        <div className="py-4">
          <div className="flex items-center justify-between py-3 px-4 bg-surface-hover rounded-xl mb-3">
            <div>
              <p className="text-sm font-medium text-txt-primary">Current session</p>
              <p className="text-xs text-txt-secondary mt-0.5">
                {navigator.userAgent.includes('Chrome') ? 'Chrome' :
                 navigator.userAgent.includes('Firefox') ? 'Firefox' :
                 navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser'} · Last active: just now
              </p>
            </div>
            <span className="text-xs bg-brand-500/20 text-brand-400 rounded-full px-2 py-0.5">Active</span>
          </div>
          <button
            onClick={handleLogOutOthers}
            disabled={logOutLoading}
            className="text-sm text-txt-secondary hover:text-txt-primary border border-border rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            Log out all other sessions
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication">
        <SettingRow label="2FA" description="Add an extra layer of security to your account">
          <div className="flex items-center gap-2">
            <Toggle enabled={false} disabled />
            <ComingSoonBadge />
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Connected Accounts">
        <SettingRow
          label="Google"
          description={user?.google_id ? 'Connected via Google OAuth' : 'Not connected'}
        >
          {user?.google_id ? (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <Check className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <span className="text-xs text-txt-muted">Not connected</span>
          )}
        </SettingRow>
      </SectionCard>
    </div>
  )
}

function DataSection({ user, updateUser, addToast, onAccountDeleted }) {
  const [saveChatHistory, setSaveChatHistory] = useLocalStorage('save_chat_history', true)
  const [showDeleteChatsModal, setShowDeleteChatsModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleDeleteAllChats = async () => {
    setDeleting(true)
    try {
      await api.delete('/chats/all')
      addToast('All conversations deleted', 'success')
      setShowDeleteChatsModal(false)
    } catch {
      addToast('Failed to delete conversations', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await api.delete('/auth/account')
      await logout()
      navigate('/')
    } catch {
      addToast('Failed to delete account', 'error')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {showDeleteChatsModal && (
          <ConfirmModal
            title="Delete all conversations?"
            message="This will permanently delete all your chat history. This action cannot be undone."
            confirmText="Delete all"
            onConfirm={handleDeleteAllChats}
            onCancel={() => setShowDeleteChatsModal(false)}
            destructive
          />
        )}
        {showDeleteAccountModal && (
          <ConfirmModal
            title="Delete your account?"
            message="All your data, chats, and settings will be permanently deleted. This action cannot be undone."
            confirmText="Delete account"
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteAccountModal(false)}
            destructive
            requireType="DELETE"
          />
        )}
      </AnimatePresence>

      <SectionCard title="Chat History">
        <SettingRow
          label="Save chat history"
          description={
            saveChatHistory
              ? 'New chats are saved to your history.'
              : "New chats won't be saved. Existing chats remain."
          }
        >
          <Toggle enabled={saveChatHistory} onToggle={() => setSaveChatHistory((v) => !v)} />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Export">
        <SettingRow label="Export all chats" description="Download a copy of your conversation data">
          <div className="relative group">
            <button
              disabled
              className="text-sm text-txt-secondary border border-border rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
            >
              Export data
            </button>
            <span className="absolute bottom-full mb-1.5 right-0 text-xs bg-surface-card border border-border text-txt-secondary px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Coming soon
            </span>
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Danger Zone">
        <SettingRow
          label="Delete all conversations"
          description="Permanently remove all your chat history"
        >
          <button
            onClick={() => setShowDeleteChatsModal(true)}
            className="text-sm text-red-400 border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition-colors"
          >
            Delete all
          </button>
        </SettingRow>
        <SettingRow
          label="Delete account"
          description="Permanently delete your account and all associated data"
        >
          <button
            onClick={() => setShowDeleteAccountModal(true)}
            className="text-sm text-red-400 border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition-colors"
          >
            Delete account
          </button>
        </SettingRow>
      </SectionCard>
    </div>
  )
}

// ── Main Settings page ────────────────────────────────────────────────────────

const TABS = [
  { id: 'general',       label: 'General',       icon: SettingsIcon },
  { id: 'personalization', label: 'Personalization', icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'plans',         label: 'Plans & Billing', icon: CreditCard },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'data',          label: 'Data controls',  icon: Database },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const { user, updateUser, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const sectionProps = { user, updateUser, addToast, logout, navigate }

  const renderSection = () => {
    switch (activeTab) {
      case 'general':        return <GeneralSection {...sectionProps} />
      case 'personalization': return <PersonalizationSection {...sectionProps} />
      case 'notifications':  return <NotificationsSection {...sectionProps} />
      case 'profile':        return <ProfileSection {...sectionProps} />
      case 'plans':          return <PlansSection {...sectionProps} />
      case 'security':       return <SecuritySection {...sectionProps} />
      case 'data':           return <DataSection {...sectionProps} />
      default:               return null
    }
  }

  return (
    <div className="min-h-screen bg-surface text-txt-primary">
      {/* Header */}
      <header className="border-b border-border bg-surface-sidebar sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-txt-secondary hover:text-txt-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-txt-primary">AQIZA AI Settings</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar nav — desktop */}
        <nav className="hidden md:flex flex-col w-56 flex-shrink-0 gap-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeTab === id
                  ? 'bg-surface-hover text-txt-primary font-medium'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile tab bar */}
        <div className="md:hidden w-full mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 pb-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === id
                    ? 'bg-surface-hover text-txt-primary'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-hover'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

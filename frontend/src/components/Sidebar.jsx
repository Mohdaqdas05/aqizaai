import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  PenSquare,
  Search,
  Image,
  Grid2x2,
  Folder,
  Bookmark,
  Trash2,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
  MoreHorizontal,
} from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useChatContext } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

function Tooltip({ label, children, disabled }) {
  const [show, setShow] = useState(false)
  if (disabled) return children
  return (
    <div
      className="relative flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-surface-card text-txt-primary text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border shadow-xl pointer-events-none"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const NAV_ITEMS = [
  { icon: Image,   label: 'Images'   },
  { icon: Grid2x2, label: 'Apps'     },
  { icon: Folder,  label: 'Projects' },
  { icon: Bookmark,label: 'Saved'    },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useLocalStorage('sidebar_expanded', true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage('dark_mode', true)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  const { chats, currentChat, createChat, selectChat, deleteChat, fetchChats } =
    useChatContext()
  const { user, logout } = useAuth()

  // Fetch chats on mount
  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  // Apply dark mode to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Close profile dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNewChat = async () => {
    try {
      await createChat()
    } catch (err) {
      console.error('createChat error:', err)
    }
  }

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login')
  }

  const avatarLetter = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <motion.aside
      role="navigation"
      aria-label="Main sidebar"
      animate={{ width: isExpanded ? 260 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-surface-sidebar border-r border-border flex-shrink-0 overflow-hidden relative"
    >
      {/* ── A. Header ── */}
      <div className="flex items-center h-14 px-3 flex-shrink-0">
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                A
              </div>
              <span className="font-semibold text-txt-primary text-sm truncate">
                AQIZA AI
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((v) => !v)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors flex-shrink-0 ${
            !isExpanded ? 'mx-auto' : 'ml-auto'
          }`}
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── B. New Chat ── */}
      <div className="px-2 mb-1">
        <Tooltip label="New Chat" disabled={isExpanded}>
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-txt-primary bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-colors text-sm font-medium ${
              !isExpanded ? 'justify-center' : ''
            }`}
          >
            <PenSquare className="w-4 h-4 text-brand-400 flex-shrink-0" />
            {isExpanded && <span>New Chat</span>}
          </button>
        </Tooltip>
      </div>

      {/* ── C. Search ── */}
      <div className="px-2 mb-2">
        <Tooltip label="Search" disabled={isExpanded}>
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors text-sm ${
              !isExpanded ? 'justify-center' : ''
            }`}
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            {isExpanded && <span>Search</span>}
          </button>
        </Tooltip>
      </div>

      {/* ── D. Nav items ── */}
      <div className="px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label }) => (
          <Tooltip key={label} label={label} disabled={isExpanded}>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors text-sm ${
                !isExpanded ? 'justify-center' : ''
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {isExpanded && <span>{label}</span>}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* ── E. Divider + Recent ── */}
      <div className="px-3 mt-4 mb-1">
        <div className="border-t border-border mb-2" />
        {isExpanded && (
          <span className="text-xs font-medium text-txt-muted uppercase tracking-wider">
            Recent Chats
          </span>
        )}
      </div>

      {/* ── F. Chat history ── */}
      <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-0.5 scrollbar-hide">
        {chats.length === 0 && isExpanded && (
          <p className="text-xs text-txt-muted px-3 py-2">No chats yet</p>
        )}
        {chats.map((chat) => {
          const id = chat._id || chat.id
          const isActive = (currentChat?._id || currentChat?.id) === id
          return (
            <Tooltip key={id} label={chat.title || 'Untitled'} disabled={isExpanded}>
              <div
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                  isActive
                    ? 'bg-brand-500/15 text-txt-primary'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-hover'
                } ${!isExpanded ? 'justify-center' : ''}`}
                onClick={() => selectChat(id)}
              >
                {isExpanded ? (
                  <>
                    <span className="flex-1 truncate">{chat.title || 'Untitled'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-all flex-shrink-0"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isActive ? 'bg-brand-400' : 'bg-surface-hover group-hover:bg-txt-muted'
                    }`}
                  />
                )}
              </div>
            </Tooltip>
          )
        })}
      </div>

      {/* ── H. Profile section ── */}
      <div ref={profileRef} className="relative flex-shrink-0 border-t border-border">
        {/* Dropdown */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-2 right-2 mb-2 bg-surface-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <button
                onClick={() => { setDarkMode((v) => !v); setProfileOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-surface-hover transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <div className="border-t border-border my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile row */}
        <div
          className={`flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-surface-hover transition-colors ${
            !isExpanded ? 'justify-center' : ''
          }`}
          onClick={() => setProfileOpen((v) => !v)}
        >
          <div className="w-8 h-8 rounded-full bg-brand-500/80 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {avatarLetter}
          </div>
          {isExpanded && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-txt-primary truncate leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-txt-secondary truncate leading-tight">
                  {user?.email || ''}
                </p>
              </div>
              <MoreHorizontal className="w-4 h-4 text-txt-muted flex-shrink-0" />
            </>
          )}
        </div>
      </div>
    </motion.aside>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-900/80 border-green-700',
    icon_cls: 'text-green-400',
    text: 'text-green-100',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-900/80 border-red-700',
    icon_cls: 'text-red-400',
    text: 'text-red-100',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-900/80 border-yellow-700',
    icon_cls: 'text-yellow-400',
    text: 'text-yellow-100',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-900/80 border-blue-700',
    icon_cls: 'text-blue-400',
    text: 'text-blue-100',
  },
}

function ToastItem({ toast }) {
  const { removeToast } = useToast()
  const cfg = typeConfig[toast.type] || typeConfig.info
  const Icon = cfg.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl min-w-[280px] max-w-sm ${cfg.bg}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.icon_cls}`} />
      <p className={`flex-1 text-sm font-medium ${cfg.text}`}>
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default function Toast() {
  const { toasts } = useToast()

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'

const FALLBACK_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-4o',      name: 'GPT-4o'      },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
]

export default function ModelSelector({ value, onChange }) {
  const [models, setModels] = useState(FALLBACK_MODELS)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    api
      .get('/models')
      .then((res) => {
        const list = res.data?.models || res.data
        if (Array.isArray(list) && list.length) setModels(list)
      })
      .catch(() => {}) // silently use fallback
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = models.find((m) => (m.id || m._id) === value) || models[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-txt-primary hover:bg-surface-hover px-2 py-1 rounded-lg transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current?.name || 'Select model'}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 min-w-[200px] bg-surface-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 py-1"
          >
            {models.map((model) => {
              const id = model.id || model._id
              const isSelected = id === value
              return (
                <li
                  key={id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(id)
                    setOpen(false)
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm">{model.name}</span>
                    {model.description && (
                      <span className="text-xs text-txt-muted mt-0.5 truncate max-w-[140px]">
                        {model.description}
                      </span>
                    )}
                    {model.contextLength && (
                      <span className="text-xs text-txt-muted">
                        {model.contextLength.toLocaleString()} ctx
                      </span>
                    )}
                  </div>
                  {model.tier && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-surface-hover text-txt-muted flex-shrink-0">
                      {model.tier}
                    </span>
                  )}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

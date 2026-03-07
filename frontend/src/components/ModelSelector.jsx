import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'

const FALLBACK_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter' },
  { id: 'gpt-4o',      name: 'GPT-4o',      provider: 'openrouter' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'openrouter' },
]

const PROVIDER_LABELS = {
  openrouter: 'OpenRouter',
  openai:     'OpenAI Direct',
  gemini:     'Google Gemini Direct',
}

const PROVIDER_BADGE_CLASSES = {
  openrouter: 'bg-violet-500/20 text-violet-400',
  openai:     'bg-emerald-500/20 text-emerald-400',
  gemini:     'bg-blue-500/20 text-blue-400',
}

const PROVIDER_SHORT = {
  openrouter: 'OR',
  openai:     'OAI',
  gemini:     'GGL',
}
const groupByProvider = (models) => {
  const groups = {}
  for (const model of models) {
    const provider = model.provider || 'openrouter'
    if (!groups[provider]) groups[provider] = []
    groups[provider].push(model)
  }
  return groups
}

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
  const grouped = groupByProvider(models)
  const providerKeys = Object.keys(grouped)
  const multipleProviders = providerKeys.length > 1

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-border text-sm text-txt-secondary hover:text-txt-primary hover:border-brand-500/40 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-medium text-txt-primary">{current?.name || 'Select model'}</span>
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
            className="absolute bottom-full mb-2 left-0 min-w-[220px] bg-surface-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 py-1"
          >
            {providerKeys.map((provider) => (
              <li key={provider}>
                {multipleProviders && (
                  <div className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-txt-muted select-none">
                    {PROVIDER_LABELS[provider] || provider}
                  </div>
                )}
                <ul>
                  {grouped[provider].map((model) => {
                    const id = model.id || model._id
                    const isSelected = id === value
                    const badgeClasses = PROVIDER_BADGE_CLASSES[provider] || PROVIDER_BADGE_CLASSES.openrouter
                    return (
                      <li
                        key={id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(id)
                          setOpen(false)
                        }}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? 'text-brand-400 bg-brand-500/10'
                            : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-hover'
                        }`}
                      >
                        <span>{model.name}</span>
                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                          {multipleProviders && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badgeClasses}`}>
                              {PROVIDER_SHORT[provider] || provider}
                            </span>
                          )}
                          {model.tier && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-hover text-txt-muted">
                              {model.tier}
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

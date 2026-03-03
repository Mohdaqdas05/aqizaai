import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Paperclip, Mic, StopCircle, Sparkles, Code2, Globe, BookOpen } from 'lucide-react'
import { useChatContext } from '../context/ChatContext'
import { useToast } from '../context/ToastContext'
import MessageBubble from './MessageBubble'
import ModelSelector from './ModelSelector'
import { ChatSkeleton } from './Skeleton'
import api from '../api/axios'

const SUGGESTIONS = [
  { icon: Sparkles, text: 'Explain quantum computing in simple terms' },
  { icon: Code2,    text: 'Write a Python script to sort a list of dicts' },
  { icon: Globe,    text: 'What are the latest trends in AI for 2025?' },
  { icon: BookOpen, text: 'Summarize the key ideas of Stoicism' },
]

export default function ChatWindow() {
  const { currentChat, messages, isLoading, isStreaming, sendMessage, stopStreaming } =
    useChatContext()
  const { addToast } = useToast()

  const [input, setInput] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  // Fetch default model from backend on mount
  useEffect(() => {
    api.get('/models').then((res) => {
      const list = res.data?.models || res.data
      if (Array.isArray(list) && list.length) {
        const defaultModel = list.find((m) => m.isDefault) || list[0]
        if (defaultModel) setModel(defaultModel.id || defaultModel._id)
      }
    }).catch(() => {}) // fallback to hardcoded default
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'
  }, [input])

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(trimmed, model)
  }, [input, isStreaming, sendMessage, model])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (text) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  const canSend = input.trim().length > 0 && !isStreaming

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatSkeleton />
        ) : !currentChat ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-brand-400">A</span>
            </div>
            <h1 className="text-2xl font-semibold text-txt-primary mb-2">
              Ready when you are.
            </h1>
            <p className="text-txt-secondary mb-10 max-w-sm">
              Start a conversation with AQIZA AI — ask anything.
            </p>

            {/* Suggestions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => handleSuggestion(text)}
                  className="flex items-start gap-3 p-4 rounded-xl bg-surface-card border border-border hover:border-brand-500/40 hover:bg-surface-hover text-left transition-colors group"
                >
                  <Icon className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0 group-hover:text-brand-300" />
                  <span className="text-sm text-txt-secondary group-hover:text-txt-primary transition-colors leading-snug">
                    {text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Messages ── */
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id || msg.id}
                message={msg}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 border-t border-border bg-surface px-4 pt-3 pb-4">
        <div className="max-w-3xl mx-auto">
          {/* Model selector row */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <ModelSelector value={model} onChange={setModel} />
            {isStreaming && (
              <button
                onClick={stopStreaming}
                className="flex items-center gap-1.5 text-xs text-txt-secondary hover:text-red-400 transition-colors ml-auto"
              >
                <StopCircle className="w-3.5 h-3.5" />
                Stop
              </button>
            )}
          </div>

          {/* Textarea + action buttons */}
          <div className="flex items-end gap-2 bg-surface-input border border-border rounded-2xl px-4 py-3 focus-within:border-brand-500/50 transition-colors">
            {/* Attach */}
            <button
              onClick={() => addToast('File attachments coming soon!', 'info')}
              className="text-txt-muted hover:text-txt-secondary transition-colors mb-0.5 flex-shrink-0"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AQIZA AI…"
              rows={1}
              className="flex-1 bg-transparent text-txt-primary placeholder-txt-muted text-sm outline-none resize-none overflow-y-auto max-h-44 leading-relaxed"
              style={{ overflowY: 'auto' }}
              aria-label="Chat input"
            />

            {/* Voice */}
            <button
              onClick={() => addToast('Voice input coming soon!', 'info')}
              className="text-txt-muted hover:text-txt-secondary transition-colors mb-0.5 flex-shrink-0"
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                canSend
                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                  : 'bg-surface-hover text-txt-muted cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-xs text-txt-muted mt-2">
            AQIZA AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}

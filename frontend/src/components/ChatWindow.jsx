import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Paperclip, Mic, StopCircle, Sparkles, Code2, Globe, BookOpen } from 'lucide-react'
import { useChatContext } from '../context/ChatContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
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

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function ChatWindow() {
  const { currentChat, messages, isLoading, isStreaming, sendMessage, stopStreaming } =
    useChatContext()
  const { addToast } = useToast()
  const { user } = useAuth()

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
  const firstName = user?.name?.split(' ')[0] || null

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* ── Chat header (shown when a chat is active) ── */}
      {currentChat && (
        <div className="flex-shrink-0 flex items-center justify-center h-12 border-b border-border bg-surface px-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-txt-primary truncate max-w-xs">
              {currentChat.title || 'Untitled'}
            </span>
            <span className="text-txt-muted">·</span>
            <span className="text-txt-secondary">{model}</span>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ChatSkeleton />
        ) : !currentChat ? (
          /* ── Empty / welcome state ── */
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <h1 className="text-3xl font-semibold text-txt-primary mb-3">
              {firstName ? `${getGreeting()}, ${firstName}!` : 'What can I help with?'}
            </h1>
            {firstName && (
              <p className="text-txt-secondary mb-10 text-base">What can I help with?</p>
            )}

            {/* Suggestions grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xl mt-4">
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => handleSuggestion(text)}
                  className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-surface-card border border-border hover:border-brand-500/40 hover:bg-surface-hover text-left transition-colors group"
                >
                  <Icon className="w-5 h-5 text-brand-400 group-hover:text-brand-300 flex-shrink-0" />
                  <span className="text-sm text-txt-secondary group-hover:text-txt-primary transition-colors leading-snug">
                    {text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Messages ── */
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
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

      {/* ── Input bar (floating pill) ── */}
      <div className="flex-shrink-0 px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-[#2f2f2f] rounded-3xl px-3 py-2.5 shadow-lg focus-within:ring-1 focus-within:ring-brand-500/30 transition-all">
            {/* Model selector (inline, before textarea) */}
            <div className="flex-shrink-0 self-end mb-0.5">
              <ModelSelector value={model} onChange={setModel} />
            </div>

            {/* Attach */}
            <button
              onClick={() => addToast('File attachments coming soon!', 'info')}
              className="text-txt-muted hover:text-txt-secondary transition-colors mb-0.5 flex-shrink-0 self-end"
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
              className="flex-1 bg-transparent text-txt-primary placeholder-txt-muted text-sm outline-none resize-none overflow-y-auto max-h-44 leading-relaxed py-1"
              style={{ overflowY: 'auto' }}
              aria-label="Chat input"
            />

            {/* Voice */}
            <button
              onClick={() => addToast('Voice input coming soon!', 'info')}
              className="text-txt-muted hover:text-txt-secondary transition-colors mb-0.5 flex-shrink-0 self-end"
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send / Stop */}
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-surface-hover hover:bg-red-500/20 text-txt-secondary hover:text-red-400 transition-colors self-end"
                aria-label="Stop streaming"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors self-end ${
                  canSend
                    ? 'bg-brand-500 hover:bg-brand-600 text-white'
                    : 'bg-surface-hover text-txt-muted cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-center text-xs text-txt-muted mt-2">
            AQIZA AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}

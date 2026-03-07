import { useState } from 'react'
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'
import { useAuth } from '../context/AuthContext'

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const { content, createdAt, isStreaming, error } = message
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()

  const avatarLetter = isUser
    ? (user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U')
    : 'A'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end group animate-fade-in">
        <div className="max-w-[72%] flex flex-col items-end">
          <p className="text-sm text-txt-primary leading-relaxed whitespace-pre-wrap break-words text-right">
            {content}
          </p>
          <span className="text-xs text-txt-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            {formatTime(createdAt)}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-500/80 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 mt-0.5">
          {avatarLetter}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 group animate-fade-in">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
        A
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm leading-relaxed ${
            error ? 'text-red-300' : 'text-txt-primary'
          }`}
        >
          {error ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div className="prose-dark prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline ? (
                      <CodeBlock language={match ? match[1] : null}>
                        {children}
                      </CodeBlock>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {content || ''}
              </ReactMarkdown>
              {/* Typing cursor while streaming */}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-brand-400 ml-0.5 align-middle animate-blink rounded-sm" />
              )}
            </div>
          )}
        </div>

        {/* Action row — shown on hover, hidden while streaming */}
        {!isStreaming && (
          <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-surface-hover text-txt-muted hover:text-txt-secondary transition-colors"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-surface-hover text-txt-muted hover:text-txt-secondary transition-colors"
              aria-label="Thumbs up"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-surface-hover text-txt-muted hover:text-txt-secondary transition-colors"
              aria-label="Thumbs down"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-surface-hover text-txt-muted hover:text-txt-secondary transition-colors"
              aria-label="Regenerate response"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-txt-muted ml-1">
              {formatTime(createdAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

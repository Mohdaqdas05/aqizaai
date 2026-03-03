import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'

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

  const avatarLetter = isUser ? 'U' : 'A'

  return (
    <div
      className={`flex gap-3 group animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${
          isUser
            ? 'bg-brand-500 text-white'
            : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
        }`}
      >
        {avatarLetter}
      </div>

      {/* Bubble */}
      <div
        className={`flex flex-col gap-1 max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-500 text-white rounded-tr-sm'
              : error
              ? 'bg-red-900/30 border border-red-800 text-red-200 rounded-tl-sm'
              : 'bg-surface-card border border-border text-txt-primary rounded-tl-sm'
          }`}
        >
          {isUser ? (
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

        {/* Timestamp */}
        <span className="text-xs text-txt-muted opacity-0 group-hover:opacity-100 transition-opacity px-1">
          {formatTime(createdAt)}
        </span>
      </div>
    </div>
  )
}

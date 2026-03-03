import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'

export default function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)

  const code = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border my-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2e] border-b border-border">
        <span className="text-xs font-mono text-txt-secondary">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-txt-secondary hover:text-txt-primary transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        PreTag="div"
        showLineNumbers={code.split('\n').length > 4}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#0d1117',
          fontSize: '0.82rem',
          lineHeight: '1.6',
          padding: '1rem 1.25rem',
        }}
        lineNumberStyle={{ color: '#444', minWidth: '2.5em' }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

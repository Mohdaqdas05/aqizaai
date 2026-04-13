"use client";

import { useState, ReactNode, isValidElement, Children } from "react";

interface CodeBlockProps {
  children: ReactNode;
}

function extractCodeInfo(children: ReactNode): { language: string; code: string } {
  let language = "";
  let code = "";

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.props) {
      const props = child.props as { className?: string; children?: ReactNode };
      const className = props.className || "";
      const match = className.match(/language-(\w+)/);
      if (match) {
        language = match[1];
      }
      // Extract text content from code element
      const extractText = (node: ReactNode): string => {
        if (typeof node === "string") return node;
        if (typeof node === "number") return String(node);
        if (isValidElement(node)) {
          const nodeProps = node.props as { children?: ReactNode };
          return extractText(nodeProps.children);
        }
        if (Array.isArray(node)) {
          return node.map(extractText).join("");
        }
        return "";
      };
      code = extractText(props.children);
    }
  });

  return { language, code };
}

export default function CodeBlock({ children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { language, code } = extractCodeInfo(children);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-language">{language || "text"}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}

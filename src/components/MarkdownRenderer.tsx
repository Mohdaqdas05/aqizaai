"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CodeBlock from "./CodeBlock";
import type { ComponentPropsWithoutRef } from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      /* eslint-disable-next-line react/no-children-prop */
      children={content}
      components={{
        pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
          return <>{children ? <CodeBlock {...props}>{children}</CodeBlock> : null}</>;
        },
        code({ className, children, ...props }: ComponentPropsWithoutRef<"code"> & { className?: string }) {
          const isInline = !className;
          if (isInline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          // Block code is handled by the pre → CodeBlock wrapper
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    />
  );
}

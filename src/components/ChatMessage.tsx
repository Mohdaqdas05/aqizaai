"use client";

import { MessageType } from "@/types";
import MarkdownRenderer from "./MarkdownRenderer";
import { AVAILABLE_MODELS } from "@/lib/ai-providers";

interface ChatMessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";
  const modelInfo = message.model
    ? AVAILABLE_MODELS.find((m) => m.id === message.model)
    : null;

  return (
    <div className={`chat-message ${isUser ? "chat-message-user" : "chat-message-assistant"}`}>
      {isUser ? (
        <div className="message-content">{message.content}</div>
      ) : (
        <div>
          <div className="message-header">
            <div className="message-avatar message-avatar-ai">A</div>
            {modelInfo && (
              <span className="message-model-badge">{modelInfo.name}</span>
            )}
          </div>
          <div className="message-content markdown-content">
            <MarkdownRenderer content={message.content} />
            {isStreaming && <span className="streaming-cursor" />}
          </div>
        </div>
      )}
    </div>
  );
}

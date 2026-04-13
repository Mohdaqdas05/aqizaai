"use client";

import { useEffect, useRef } from "react";
import { MessageType } from "@/types";
import ChatMessage from "./ChatMessage";

interface ChatThreadProps {
  messages: MessageType[];
  isStreaming: boolean;
  streamingContent: string;
  currentModel: string;
}

export default function ChatThread({
  messages,
  isStreaming,
  streamingContent,
  currentModel,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <div className="chat-thread">
      <div className="chat-thread-inner">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isStreaming && streamingContent && (
          <ChatMessage
            message={{
              id: "streaming",
              role: "assistant",
              content: streamingContent,
              model: currentModel,
              conversationId: "",
              createdAt: new Date().toISOString(),
            }}
            isStreaming
          />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

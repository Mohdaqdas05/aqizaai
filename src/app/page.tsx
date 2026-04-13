"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatThread from "@/components/ChatThread";
import ChatInput from "@/components/ChatInput";
import { ConversationType, MessageType } from "@/types";

const SUGGESTIONS = [
  "Explain how async/await works in JavaScript",
  "Write a Python script to parse CSV files",
  "What are the SOLID principles in OOP?",
  "Create a React custom hook for dark mode",
];

export default function HomePage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentModel, setCurrentModel] = useState("gemini-2.5-flash");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: MessageType = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        conversationId: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent("");

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            model: currentModel,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error("Failed to send message");

        const conversationId = res.headers.get("X-Conversation-Id");

        // Read streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // Parse Vercel AI SDK data stream
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("0:")) {
                // Text chunk from Vercel AI SDK
                try {
                  const text = JSON.parse(line.slice(2));
                  fullContent += text;
                  setStreamingContent(fullContent);
                } catch {
                  // Skip malformed lines
                }
              }
            }
          }
        }

        // Add completed assistant message
        const assistantMessage: MessageType = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullContent,
          model: currentModel,
          conversationId: conversationId || "",
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Navigate to conversation
        if (conversationId) {
          router.push(`/chat/${conversationId}`);
          fetchConversations();
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Streaming error:", error);
          const errorMessage: MessageType = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Sorry, there was an error processing your request. Please try again.",
            conversationId: "",
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [messages, currentModel, router]
  );

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    if (streamingContent) {
      const partialMessage: MessageType = {
        id: `partial-${Date.now()}`,
        role: "assistant",
        content: streamingContent,
        model: currentModel,
        conversationId: "",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, partialMessage]);
    }
    setStreamingContent("");
  };

  const handleNewChat = () => {
    setMessages([]);
    setStreamingContent("");
    setIsStreaming(false);
  };

  const handleSelectConversation = (id: string) => {
    router.push(`/chat/${id}`);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const showEmptyState = messages.length === 0 && !isStreaming;

  return (
    <div className="app-layout">
      <Sidebar
        conversations={conversations}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="main-content">
        <div className="chat-header">
          <div className="chat-header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="chat-header-title">New Chat</span>
          </div>
        </div>

        {showEmptyState ? (
          <div className="chat-empty">
            <div className="chat-empty-logo">AqizaAI</div>
            <h2>How can I help you today?</h2>
            <p>
              Developer-focused AI chat. Switch between Gemini, Groq, and
              OpenRouter models for the best experience.
            </p>
            <div className="suggestions-grid">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-card"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatThread
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            currentModel={currentModel}
          />
        )}

        <ChatInput
          onSend={handleSendMessage}
          isStreaming={isStreaming}
          onStop={handleStop}
          currentModel={currentModel}
          onModelChange={setCurrentModel}
        />
      </div>
    </div>
  );
}

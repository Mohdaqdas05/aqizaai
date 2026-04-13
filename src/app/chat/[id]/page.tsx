"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatThread from "@/components/ChatThread";
import ChatInput from "@/components/ChatInput";
import { ConversationType, MessageType } from "@/types";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentModel, setCurrentModel] = useState("gemini-2.5-flash");
  const [conversationTitle, setConversationTitle] = useState("Chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch conversation data
  useEffect(() => {
    const loadConversation = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setConversationTitle(data.title);
          setCurrentModel(data.model);
        } else {
          router.push("/");
        }
      } catch {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    if (conversationId) loadConversation();
  }, [conversationId, router]);

  // Fetch all conversations for sidebar
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
    } catch {
      console.error("Failed to fetch conversations");
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: MessageType = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        conversationId,
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
            conversationId,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error("Failed to send message");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("0:")) {
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

        const assistantMessage: MessageType = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fullContent,
          model: currentModel,
          conversationId,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        fetchConversations(); // Refresh sidebar
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Streaming error:", error);
          const errorMessage: MessageType = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Sorry, there was an error processing your request. Please try again.",
            conversationId,
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
    [messages, currentModel, conversationId]
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
        conversationId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, partialMessage]);
    }
    setStreamingContent("");
  };

  const handleNewChat = () => {
    router.push("/");
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
        if (id === conversationId) {
          router.push("/");
        }
      }
    } catch {
      console.error("Failed to delete conversation");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        conversations={conversations}
        activeConversationId={conversationId}
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
            <span className="chat-header-title">{conversationTitle}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="chat-empty">
            <div className="spinner" />
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

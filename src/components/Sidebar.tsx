"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConversationType } from "@/types";
import ThemeToggle from "./ThemeToggle";

interface SidebarProps {
  conversations: ConversationType[];
  activeConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onToggle,
}: SidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = useCallback(() => {
    onNewChat();
    router.push("/");
  }, [onNewChat, router]);

  // Keyboard shortcut: Ctrl+K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewChat]);

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}
      <aside className={`sidebar ${!isOpen ? "sidebar-hidden" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            AqizaAI
          </div>
          <ThemeToggle />
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
            ⌘K
          </span>
        </button>

        {conversations.length > 5 && (
          <div style={{ padding: "0 12px" }}>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 13,
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        )}

        <div className="sidebar-conversations">
          {filtered.length > 0 && (
            <div className="sidebar-section-label">Recent</div>
          )}
          {filtered.map((conv) => (
            <button
              key={conv.id}
              className={`conversation-item ${
                conv.id === activeConversationId ? "active" : ""
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="conversation-item-title">{conv.title}</span>
              <button
                className="conversation-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                aria-label="Delete conversation"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                </svg>
              </button>
            </button>
          ))}
          {filtered.length === 0 && conversations.length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "32px 16px",
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              No conversations yet. Start a new chat!
            </p>
          )}
        </div>

        <div className="sidebar-footer">
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
            AqizaAI v2.0 — Built for developers
          </p>
        </div>
      </aside>
    </>
  );
}

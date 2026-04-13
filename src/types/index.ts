export interface ConversationType {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageType {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string | null;
  conversationId: string;
  createdAt: string;
}

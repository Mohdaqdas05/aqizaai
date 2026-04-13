import { streamText } from "ai";
import { getModel } from "@/lib/ai-providers";
import { db } from "@/lib/db";
import { generateTitle } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { messages, model, conversationId } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const modelId = model || "gemini-2.5-flash";

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const userMessage = messages.find(
        (m: { role: string }) => m.role === "user"
      );
      const title = userMessage
        ? generateTitle(userMessage.content)
        : "New Chat";

      const conversation = await db.conversation.create({
        data: {
          title,
          model: modelId,
        },
      });
      convId = conversation.id;
    }

    // Save user message (last message in array)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      await db.message.create({
        data: {
          role: "user",
          content: lastMessage.content,
          conversationId: convId,
        },
      });
    }

    // Update conversation title if it's the first message
    const messageCount = await db.message.count({
      where: { conversationId: convId },
    });
    if (messageCount === 1) {
      await db.conversation.update({
        where: { id: convId },
        data: { title: generateTitle(lastMessage.content) },
      });
    }

    const aiModel = getModel(modelId);

    const result = streamText({
      model: aiModel,
      messages: messages.map(
        (m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })
      ),
    });

    // Save assistant message after stream completes (in background)
    result.text.then(async (fullText) => {
      try {
        await db.message.create({
          data: {
            role: "assistant",
            content: fullText,
            model: modelId,
            conversationId: convId,
          },
        });
        await db.conversation.update({
          where: { id: convId },
          data: { updatedAt: new Date() },
        });
      } catch {
        console.error("Failed to save assistant message");
      }
    });

    // Return streaming response with conversation ID in header
    const response = result.toDataStreamResponse();

    // Add conversation ID to response headers
    const headers = new Headers(response.headers);
    headers.set("X-Conversation-Id", convId);

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

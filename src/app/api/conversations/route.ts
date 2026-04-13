import { db } from "@/lib/db";
import { NextRequest } from "next/server";

// GET /api/conversations - List all conversations
export async function GET() {
  try {
    const conversations = await db.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
    return Response.json(conversations);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return Response.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations?id=xxx - Delete a conversation
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return Response.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    await db.conversation.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return Response.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations - Update conversation title
export async function PATCH(request: NextRequest) {
  try {
    const { id, title } = await request.json();
    if (!id || !title) {
      return Response.json(
        { error: "ID and title are required" },
        { status: 400 }
      );
    }

    const conversation = await db.conversation.update({
      where: { id },
      data: { title },
    });

    return Response.json(conversation);
  } catch (error) {
    console.error("Failed to update conversation:", error);
    return Response.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function sanitizeWorkspaceSlug(name: string): string {
  return (name || 'default').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function getFallbackFilePath(slug: string): string {
  return path.join(DATA_DIR, `chat_history_${slug}.json`);
}

function readFallbackMessages(slug: string): any[] {
  try {
    ensureDataDir();
    const filePath = getFallbackFilePath(slug);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (err) {
    console.error(`[CHAT_CONVERSATION] Failed to read fallback chat for ${slug}:`, err);
    return [];
  }
}

function writeFallbackMessages(slug: string, messages: any[]) {
  try {
    ensureDataDir();
    const filePath = getFallbackFilePath(slug);
    fs.writeFileSync(filePath, JSON.stringify(messages.slice(-100), null, 2), 'utf-8');
  } catch (err) {
    console.error(`[CHAT_CONVERSATION] Failed to write fallback chat for ${slug}:`, err);
  }
}

// GET: Retrieve conversation history for a given workspace
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceName = searchParams.get('workspace') || 'FakeIt';
    const slug = sanitizeWorkspaceSlug(workspaceName);

    // 1. Try Prisma Database
    try {
      const db = prisma as any;
      if (db.workspace && db.agentConversation) {
        let ws = await db.workspace.findUnique({
          where: { slug },
          include: {
            conversations: {
              include: {
                messages: {
                  orderBy: { createdAt: 'asc' },
                  take: 100,
                },
              },
              take: 1,
            },
          },
        });

        if (ws && ws.conversations?.[0]?.messages?.length > 0) {
          const dbMessages = ws.conversations[0].messages.map((m: any) => ({
            id: m.id,
            sender: m.role === 'user' ? 'USER' : 'AI',
            text: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            toolUsed: m.toolCallsJson?.toolUsed || undefined,
            toolType: m.toolCallsJson?.toolType || undefined,
            requiresApproval: m.toolCallsJson?.requiresApproval || false,
            proposedAction: m.toolCallsJson?.proposedAction || undefined,
            reportData: m.toolCallsJson?.reportData || undefined,
            ideas: m.toolCallsJson?.ideas || undefined,
            actionStatus: m.toolCallsJson?.actionStatus || undefined,
          }));

          return NextResponse.json({
            success: true,
            source: 'database',
            workspace: workspaceName,
            messages: dbMessages,
          });
        }
      }
    } catch (dbErr) {
      console.warn(`[CHAT_CONVERSATION] DB fetch bypassed, using local store for ${slug}:`, dbErr);
    }

    // 2. Fallback to Persistent JSON Store (ensures cross-device sync even if Postgres is offline)
    const fallbackMessages = readFallbackMessages(slug);
    return NextResponse.json({
      success: true,
      source: 'persistent_store',
      workspace: workspaceName,
      messages: fallbackMessages,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch conversation',
    }, { status: 500 });
  }
}

// POST: Save or append messages to conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspace: workspaceName = 'FakeIt', messages = [], appendMessage } = body;
    const slug = sanitizeWorkspaceSlug(workspaceName);

    const messagesToSave = Array.isArray(messages) && messages.length > 0
      ? messages
      : appendMessage 
        ? [appendMessage]
        : [];

    if (messagesToSave.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // 1. Always update Persistent Server File Store for instant sync across devices
    let currentStore = readFallbackMessages(slug);
    if (Array.isArray(messages) && messages.length > 0) {
      currentStore = messages.slice(-100);
    } else if (appendMessage) {
      // Avoid duplicate by id
      if (!currentStore.some((m: any) => m.id === appendMessage.id)) {
        currentStore.push(appendMessage);
      }
    }
    writeFallbackMessages(slug, currentStore);

    // 2. Also persist to Prisma Database if available
    try {
      const db = prisma as any;
      if (db.workspace && db.agentConversation && db.agentMessage) {
        let ws = await db.workspace.findUnique({
          where: { slug },
          include: { conversations: { take: 1 } },
        });

        if (!ws) {
          ws = await db.workspace.create({
            data: {
              name: workspaceName,
              slug,
              currency: 'USD',
            },
            include: { conversations: true },
          });
        }

        let conv = ws.conversations?.[0];
        if (!conv) {
          conv = await db.agentConversation.create({
            data: {
              workspaceId: ws.id,
              title: `${workspaceName} Copilot Session`,
            },
          });
        }

        if (appendMessage) {
          await db.agentMessage.create({
            data: {
              conversationId: conv.id,
              role: appendMessage.sender === 'USER' ? 'user' : 'assistant',
              content: appendMessage.text || '',
              toolCallsJson: {
                toolUsed: appendMessage.toolUsed,
                toolType: appendMessage.toolType,
                requiresApproval: appendMessage.requiresApproval,
                proposedAction: appendMessage.proposedAction,
                reportData: appendMessage.reportData,
                ideas: appendMessage.ideas,
                actionStatus: appendMessage.actionStatus,
              },
            },
          });
        }
      }
    } catch (dbErr) {
      // Non-blocking: file store already saved the message safely
    }

    return NextResponse.json({
      success: true,
      workspace: workspaceName,
      syncedCount: currentStore.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save conversation',
    }, { status: 500 });
  }
}

// DELETE: Clear conversation history
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceName = searchParams.get('workspace') || 'FakeIt';
    const slug = sanitizeWorkspaceSlug(workspaceName);

    // 1. Clear persistent file
    writeFallbackMessages(slug, []);

    // 2. Clear from DB
    try {
      const db = prisma as any;
      if (db.workspace && db.agentConversation) {
        const ws = await db.workspace.findUnique({
          where: { slug },
          include: { conversations: true },
        });
        if (ws?.conversations?.[0]) {
          await db.agentMessage.deleteMany({
            where: { conversationId: ws.conversations[0].id },
          });
        }
      }
    } catch {}

    return NextResponse.json({ success: true, message: 'Chat history cleared' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

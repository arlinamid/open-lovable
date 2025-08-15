import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// POST: Migrate existing conversation state to database
export async function POST(request: NextRequest) {
  try {
    const { conversationState } = await request.json();

    if (!conversationState) {
      return NextResponse.json({
        success: false,
        error: 'conversationState is required'
      }, { status: 400 });
    }

    // Migrate the conversation state to a new session
    const sessionId = await db.migrateConversationState(conversationState);

    return NextResponse.json({
      success: true,
      message: 'Conversation state migrated successfully',
      sessionId
    });
  } catch (error) {
    console.error('[v2/migrate] Error migrating conversation state:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

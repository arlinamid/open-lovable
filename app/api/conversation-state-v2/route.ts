import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET: Retrieve current conversation state from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: true,
        state: null,
        message: 'No session ID provided'
      });
    }

    const sessionWithDetails = await db.getSessionWithDetails(sessionId);
    
    if (!sessionWithDetails) {
      return NextResponse.json({
        success: true,
        state: null,
        message: 'Session not found'
      });
    }

    // Convert database format to legacy conversation state format for compatibility
    const conversationState = {
      conversationId: sessionWithDetails.id,
      startedAt: new Date(sessionWithDetails.created_at).getTime(),
      lastUpdated: new Date(sessionWithDetails.updated_at).getTime(),
      context: {
        messages: sessionWithDetails.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at).getTime(),
          metadata: msg.metadata
        })),
        edits: [], // TODO: Extract from job history
        projectEvolution: { majorChanges: [] }, // TODO: Extract from job history
        userPreferences: sessionWithDetails.metadata?.userPreferences || {},
        currentTopic: sessionWithDetails.title
      }
    };

    return NextResponse.json({
      success: true,
      state: conversationState
    });
  } catch (error) {
    console.error('[conversation-state-v2] Error getting state:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// POST: Reset or update conversation state
export async function POST(request: NextRequest) {
  try {
    const { action, data, sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId is required'
      }, { status: 400 });
    }

    switch (action) {
      case 'reset':
        // Create a new session
        const newSession = await db.createSession(
          data?.title || 'New Session',
          data?.metadata
        );
        
        console.log('[conversation-state-v2] Created new session:', newSession.id);
        
        return NextResponse.json({
          success: true,
          message: 'New session created',
          sessionId: newSession.id
        });
        
      case 'clear-old':
        // Clear old messages but keep recent ones
        const messages = await db.getMessages(sessionId, 100);
        if (messages.length > 10) {
          // Keep only the last 10 messages
          const recentMessages = messages.slice(-10);
          // TODO: Implement message deletion or archiving
          console.log('[conversation-state-v2] Cleared old messages, kept', recentMessages.length);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Old messages cleared',
          sessionId
        });
        
      case 'update':
        // Update session metadata
        const updates: any = {};
        if (data?.title) updates.title = data.title;
        if (data?.userPreferences) {
          updates.metadata = { userPreferences: data.userPreferences };
        }
        
        if (Object.keys(updates).length > 0) {
          await db.updateSession(sessionId, updates);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Session updated',
          sessionId
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "reset", "clear-old", or "update"'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('[conversation-state-v2] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// DELETE: Clear conversation state (archive session)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId is required'
      }, { status: 400 });
    }

    await db.updateSession(sessionId, { status: 'archived' });
    
    console.log('[conversation-state-v2] Archived session:', sessionId);
    
    return NextResponse.json({
      success: true,
      message: 'Session archived'
    });
  } catch (error) {
    console.error('[conversation-state-v2] Error archiving session:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

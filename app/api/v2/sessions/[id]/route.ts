import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET: Get a specific session with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const includeDetails = request.nextUrl.searchParams.get('details') === 'true';

    if (includeDetails) {
      const sessionWithDetails = await db.getSessionWithDetails(sessionId);
      
      if (!sessionWithDetails) {
        return NextResponse.json({
          success: false,
          error: 'Session not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        session: sessionWithDetails
      });
    } else {
      const session = await db.getSession(sessionId);
      
      if (!session) {
        return NextResponse.json({
          success: false,
          error: 'Session not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        session
      });
    }
  } catch (error) {
    console.error('[v2/sessions/[id]] Error getting session:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// PATCH: Update a session
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const updates = await request.json();

    const session = await db.updateSession(sessionId, updates);

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('[v2/sessions/[id]] Error updating session:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// DELETE: Delete a session (soft delete by setting status to 'deleted')
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    const session = await db.updateSession(sessionId, { status: 'deleted' });

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
      session
    });
  } catch (error) {
    console.error('[v2/sessions/[id]] Error deleting session:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

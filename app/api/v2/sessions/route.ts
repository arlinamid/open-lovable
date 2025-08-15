import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET: List sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sessions = await db.listSessions(limit, offset);

    return NextResponse.json({
      success: true,
      sessions,
      pagination: {
        limit,
        offset,
        count: sessions.length
      }
    });
  } catch (error) {
    console.error('[v2/sessions] Error listing sessions:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// POST: Create a new session
export async function POST(request: NextRequest) {
  try {
    const { title, metadata } = await request.json();

    const session = await db.createSession(title, metadata);

    return NextResponse.json({
      success: true,
      session
    }, { status: 201 });
  } catch (error) {
    console.error('[v2/sessions] Error creating session:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

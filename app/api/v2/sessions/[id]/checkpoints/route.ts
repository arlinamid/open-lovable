import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET: List checkpoints for a session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    const checkpoints = await db.getCheckpoints(sessionId);

    return NextResponse.json({
      success: true,
      checkpoints
    });
  } catch (error) {
    console.error('[v2/sessions/[id]/checkpoints] Error getting checkpoints:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// POST: Create a new checkpoint
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const { label, snapshotRef, metadata } = await request.json();

    if (!label || !snapshotRef) {
      return NextResponse.json({
        success: false,
        error: 'Label and snapshotRef are required'
      }, { status: 400 });
    }

    const checkpoint = await db.createCheckpoint(sessionId, label, snapshotRef, metadata);

    return NextResponse.json({
      success: true,
      checkpoint
    }, { status: 201 });
  } catch (error) {
    console.error('[v2/sessions/[id]/checkpoints] Error creating checkpoint:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

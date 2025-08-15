import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET: List jobs (optionally filtered by session)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (sessionId) {
      const jobs = await db.listJobs(sessionId, limit, offset);
      return NextResponse.json({
        success: true,
        jobs,
        pagination: {
          limit,
          offset,
          count: jobs.length
        }
      });
    } else {
      // For now, return empty if no sessionId provided
      // In the future, we could add global job listing with proper pagination
      return NextResponse.json({
        success: true,
        jobs: [],
        pagination: {
          limit,
          offset,
          count: 0
        }
      });
    }
  } catch (error) {
    console.error('[v2/jobs] Error listing jobs:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// POST: Create a new job
export async function POST(request: NextRequest) {
  try {
    const { sessionId, type, input, parentJobId } = await request.json();

    if (!sessionId || !type || !input) {
      return NextResponse.json({
        success: false,
        error: 'sessionId, type, and input are required'
      }, { status: 400 });
    }

    const job = await db.createJob(sessionId, type, input, parentJobId);

    return NextResponse.json({
      success: true,
      job
    }, { status: 201 });
  } catch (error) {
    console.error('[v2/jobs] Error creating job:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET: Get a specific job with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const includeDetails = request.nextUrl.searchParams.get('details') === 'true';

    const job = await db.getJob(jobId);
    
    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Job not found'
      }, { status: 404 });
    }

    if (includeDetails) {
      const [tasks, artifacts, toolRuns] = await Promise.all([
        db.getTasks(jobId),
        db.getArtifacts(jobId),
        db.getToolRuns(jobId)
      ]);

      return NextResponse.json({
        success: true,
        job: {
          ...job,
          tasks,
          artifacts,
          toolRuns
        }
      });
    }

    return NextResponse.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('[v2/jobs/[id]] Error getting job:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// PATCH: Update a job
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const updates = await request.json();

    const job = await db.updateJob(jobId, updates);

    return NextResponse.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('[v2/jobs/[id]] Error updating job:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// POST: Cancel a job
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const { action } = await request.json();

    if (action === 'cancel') {
      const job = await db.updateJob(jobId, { state: 'cancelled' });

      return NextResponse.json({
        success: true,
        message: 'Job cancelled successfully',
        job
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "cancel"'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('[v2/jobs/[id]] Error cancelling job:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

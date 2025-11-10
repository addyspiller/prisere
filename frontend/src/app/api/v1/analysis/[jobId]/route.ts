import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { jobId } = params;

    // TODO: Get job from database
    // For now, return mock status based on job age
    const mockJob = {
      job_id: jobId,
      status: 'completed', // Mock as completed for demo
      created_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      updated_at: new Date().toISOString(),
      baseline_filename: 'current-policy.pdf',
      renewal_filename: 'renewal-quote.pdf',
    };

    return NextResponse.json(mockJob);

  } catch (error) {
    console.error('Get analysis status error:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis status' }, 
      { status: 500 }
    );
  }
}
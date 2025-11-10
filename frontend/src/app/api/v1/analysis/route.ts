import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const baselineFile = formData.get('baseline_file') as File;
    const renewalFile = formData.get('renewal_file') as File;

    if (!baselineFile || !renewalFile) {
      return NextResponse.json(
        { error: 'Both baseline_file and renewal_file are required' },
        { status: 400 }
      );
    }

    // Generate a job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: Implement actual file processing
    // For now, return a mock job that will complete shortly
    return NextResponse.json({
      job_id: jobId,
      status: 'processing',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      baseline_filename: baselineFile.name,
      renewal_filename: renewalFile.name,
      estimated_completion_time: new Date(Date.now() + 30000).toISOString() // 30 seconds
    });

  } catch (error) {
    console.error('Create analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis' }, 
      { status: 500 }
    );
  }
}
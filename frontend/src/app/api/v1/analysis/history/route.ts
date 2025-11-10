import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server'; // Temporarily disabled

export async function GET(request: NextRequest) {
  try {
    // Skip auth temporarily
    // TODO: Re-enable auth once we confirm Clerk isn't causing crashes

    // TODO: Get history from database
    // For now, return mock history data
    const mockHistory = [
      {
        job_id: 'job_1699123456789_abc123',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86200000).toISOString(),
        baseline_filename: 'business-insurance-2023.pdf',
        renewal_filename: 'renewal-quote-2024.pdf',
      },
      {
        job_id: 'job_1699023456789_def456',
        status: 'completed',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 172600000).toISOString(),
        baseline_filename: 'auto-insurance-current.pdf',
        renewal_filename: 'auto-renewal-2024.pdf',
      },
      {
        job_id: 'job_1698923456789_ghi789',
        status: 'failed',
        created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updated_at: new Date(Date.now() - 259000000).toISOString(),
        baseline_filename: 'property-insurance.pdf',
        renewal_filename: 'corrupted-file.pdf',
        error_message: 'Unable to process renewal file - file appears corrupted'
      }
    ];

    return NextResponse.json(mockHistory);

  } catch (error) {
    console.error('Get analysis history error:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis history' }, 
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server'; // Temporarily disabled

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    console.log('Getting analysis result for job:', jobId);
    
    // Skip auth for now to test if Clerk is causing the issue
    // TODO: Re-enable auth once we confirm this fixes the crash

    // TODO: Get results from database
    // For now, return mock results that match the frontend structure
    const mockResult = {
      job_id: jobId,
      summary: {
        total_changes: 8
      },
      total_changes: 8, // Keep both for compatibility
      change_categories: {
        coverage_limits: 3,
        deductibles: 2,
        exclusions: 2,
        premiums: 1
      },
      changes: [
        {
          id: "change_1",
          category: "coverage_limits",
          change_type: "decreased",
          title: "General Liability Limit",
          baseline_value: "$2,000,000",
          renewal_value: "$1,000,000",
          description: "Your general liability coverage limit has been reduced by 50%",
          impact: "high",
          explanation: "This significant reduction in coverage could leave you exposed to higher out-of-pocket costs if you face a large liability claim."
        },
        {
          id: "change_2",
          category: "premiums",
          change_type: "increased",
          title: "Annual Premium",
          baseline_value: "$4,200",
          renewal_value: "$4,850",
          description: "Annual premium increased by $650",
          impact: "medium",
          explanation: "Despite reduced coverage limits, your premium has increased by 15.5%, which may indicate higher risk factors or market conditions."
        }
      ],
      premium_comparison: {
        baseline_premium: 4200,
        renewal_premium: 4850,
        difference: 650,
        percentage_change: 15.5
      },
      suggested_actions: [
        {
          priority: "high",
          action: "Contact your broker to discuss the liability limit reduction",
          reason: "The 50% reduction in coverage is significant and may not provide adequate protection"
        },
        {
          priority: "medium", 
          action: "Shop around for alternative quotes",
          reason: "The premium increase combined with reduced coverage suggests you should explore other options"
        }
      ],
      educational_insights: [
        {
          topic: "Coverage Limits",
          insight: "Liability limits should be reviewed annually to ensure they match your current risk exposure and asset values."
        }
      ],
      confidence_score: 0.92
    };

    return NextResponse.json(mockResult);

  } catch (error) {
    console.error('Get analysis result error:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis result' }, 
      { status: 500 }
    );
  }
}
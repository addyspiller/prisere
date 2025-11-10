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

    // TODO: Get results from database
    // For now, return mock results
    const mockResult = {
      job_id: jobId,
      total_changes: 8,
      change_categories: {
        coverage_limits: 3,
        deductibles: 2,
        exclusions: 2,
        premiums: 1
      },
      changes: [
        {
          category: "coverage_limits",
          type: "decreased",
          field: "General Liability Limit",
          old_value: "$2,000,000",
          new_value: "$1,000,000",
          description: "Your general liability coverage limit has been reduced by 50%",
          impact: "high",
          explanation: "This significant reduction in coverage could leave you exposed to higher out-of-pocket costs if you face a large liability claim."
        },
        {
          category: "premiums",
          type: "increased",
          field: "Annual Premium",
          old_value: "$4,200",
          new_value: "$4,850",
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
import { AnalysisResult, PolicyChange, JobStatus } from "@/types/analysis";

export const mockPolicyChanges: PolicyChange[] = [
  {
    id: "change-1",
    category: "coverage_limit",
    change_type: "decreased",
    title: "General Liability Coverage Changed",
    description: "General liability coverage limit changed from $2M to $1M",
    baseline_value: "$2,000,000",
    renewal_value: "$1,000,000",
    change_amount: "-$1,000,000",
    percentage_change: -50,
    confidence: 0.92,
    page_references: {
      baseline: [12, 15],
      renewal: [11, 14]
    }
  },
  {
    id: "change-2", 
    category: "deductible",
    change_type: "increased",
    title: "Property Damage Deductible Changed",
    description: "Property damage deductible changed from $2,500 to $3,500",
    baseline_value: "$2,500",
    renewal_value: "$3,500", 
    change_amount: "+$1,000",
    percentage_change: 40,
    confidence: 0.88,
    page_references: {
      baseline: [8],
      renewal: [8]
    }
  },
  {
    id: "change-3",
    category: "exclusion",
    change_type: "added",
    title: "Flood Coverage Exclusion Added",
    description: "New exclusion added for flood-related damages",
    baseline_value: "Included",
    renewal_value: "Excluded",
    confidence: 0.95,
    page_references: {
      baseline: [23],
      renewal: [24, 25]
    }
  },
  {
    id: "change-4",
    category: "premium",
    change_type: "increased", 
    title: "Annual Premium Changed",
    description: "Annual premium changed from $15,000 to $16,500",
    baseline_value: "$15,000",
    renewal_value: "$16,500",
    change_amount: "+$1,500",
    percentage_change: 10,
    confidence: 0.99,
    page_references: {
      baseline: [1],
      renewal: [1]
    }
  }
];

export const mockAnalysisResult: AnalysisResult = {
  job_id: "550e8400-e29b-41d4-a716-446655440000",
  status: "completed",
  summary: {
    total_changes: 4,
    change_categories: {
      coverage_limit: 1,
      deductible: 1,
      exclusion: 1,
      premium: 1,
      terms_conditions: 0,
      other: 0
    }
  },
  changes: mockPolicyChanges,
  premium_comparison: {
    baseline_premium: 15000,
    renewal_premium: 16500,
    difference: 1500,
    percentage_change: 10
  },
  suggested_actions: [
    {
      category: "coverage_limit",
      action: "Review with broker why general liability coverage decreased from $2M to $1M",
      educational_context: "Lower liability limits mean less protection for lawsuits and claims"
    },
    {
      category: "deductible", 
      action: "Consider asking about options to maintain the previous $2,500 deductible",
      educational_context: "Higher deductibles mean more out-of-pocket costs when filing claims"
    },
    {
      category: "exclusion",
      action: "Discuss flood coverage options with your broker",
      educational_context: "Exclusions remove coverage for specific risks - consider if separate flood insurance is needed"
    }
  ],
  educational_insights: [
    {
      change_type: "coverage_limit_decrease",
      insight: "When coverage limits decrease, it means your maximum protection amount is lower"
    },
    {
      change_type: "deductible_increase", 
      insight: "Increased deductibles reduce premiums but increase your costs when claiming"
    },
    {
      change_type: "exclusion_added",
      insight: "New exclusions mean certain risks are no longer covered by your policy"
    }
  ],
  metadata: {
    analysis_version: "1.0",
    model_version: "claude-3.5-sonnet",
    processing_time_seconds: 87,
    completed_at: "2024-01-01T10:01:27Z"
  }
};

export const mockJobStatuses: JobStatus[] = [
  {
    job_id: "550e8400-e29b-41d4-a716-446655440000",
    status: "processing",
    progress: 25,
    message: "Reading your current policy...",
    updated_at: "2024-01-01T10:00:30Z"
  },
  {
    job_id: "550e8400-e29b-41d4-a716-446655440000", 
    status: "processing",
    progress: 50,
    message: "Analyzing coverage sections...",
    updated_at: "2024-01-01T10:00:45Z"
  },
  {
    job_id: "550e8400-e29b-41d4-a716-446655440000",
    status: "processing", 
    progress: 75,
    message: "Comparing coverage changes...",
    updated_at: "2024-01-01T10:01:00Z"
  },
  {
    job_id: "550e8400-e29b-41d4-a716-446655440000",
    status: "completed",
    progress: 100,
    message: "Analysis complete!",
    updated_at: "2024-01-01T10:01:27Z"
  }
];

export const educationalTips = [
  {
    icon: "💡",
    title: "Understanding Deductibles",
    content: "Deductibles are what you pay out-of-pocket before insurance kicks in. Higher deductibles = lower premiums"
  },
  {
    icon: "🛡️", 
    title: "Coverage Limits Explained",
    content: "Coverage limits are the maximum amount your insurer will pay for a claim. Always review if these amounts still match your business needs."
  },
  {
    icon: "📋",
    title: "Policy Exclusions", 
    content: "Exclusions are specific situations or items your policy doesn't cover. New exclusions mean you'll need separate coverage for those risks."
  },
  {
    icon: "💰",
    title: "Premium Changes",
    content: "Premium changes often reflect changes in coverage or your business risk profile. Higher premiums don't always mean better coverage."
  },
  {
    icon: "🏢",
    title: "General Liability Protection",
    content: "General liability protects your business from customer injury or property damage claims. Ensure limits match your business size and risk."
  }
];
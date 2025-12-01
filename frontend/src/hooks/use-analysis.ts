"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { analysisApi } from "@/lib/api";
import { AnalysisJob } from "@/types/api";

export const ANALYSIS_QUERY_KEYS = {
  all: ["analysis"] as const,
  status: (jobId: string) => [...ANALYSIS_QUERY_KEYS.all, "status", jobId] as const,
  result: (jobId: string) => [...ANALYSIS_QUERY_KEYS.all, "result", jobId] as const,
  history: () => [...ANALYSIS_QUERY_KEYS.all, "history"] as const,
};

// Create analysis mutation (two-step: upload files, then create analysis)
export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      baselineFile,
      renewalFile,
      metadata,
    }: {
      baselineFile: File;
      renewalFile: File;
      metadata?: { company_name?: string; policy_type?: string };
    }) => {
      // Step 1: Upload files to S3 and get S3 keys
      const { baseline_s3_key, renewal_s3_key } = await analysisApi.uploadFiles(
        baselineFile,
        renewalFile
      );

      // Step 2: Create analysis job with S3 keys
      return analysisApi.createAnalysis(
        baseline_s3_key,
        renewal_s3_key,
        metadata
      );
    },
    onSuccess: (data: AnalysisJob) => {
      // Cache the new job status
      queryClient.setQueryData(
        ANALYSIS_QUERY_KEYS.status(data.job_id),
        data
      );
      // Invalidate history to refetch
      queryClient.invalidateQueries({
        queryKey: ANALYSIS_QUERY_KEYS.history(),
      });
    },
  });
}

// Get analysis status with polling
export function useAnalysisStatus(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ANALYSIS_QUERY_KEYS.status(jobId),
    queryFn: () => analysisApi.getAnalysisStatus(jobId),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      
      // Stop polling only when we reach a terminal state
      if (status === "completed" || status === "failed") {
        return false;
      }
      
      // Keep polling for pending, processing, or any other state
      return 3000;
    },
    refetchIntervalInBackground: true,
  });
}

// Get analysis result
export function useAnalysisResult(jobId: string, enabled = true, poll = false) {
  return useQuery({
    queryKey: ANALYSIS_QUERY_KEYS.result(jobId),
    queryFn: () => analysisApi.getAnalysisResult(jobId),
    enabled: enabled && !!jobId,
    staleTime: 5 * 60 * 1000, // Results are stable for 5 minutes
    refetchInterval: poll ? 2000 : false, // Poll every 2 seconds when poll is true
    retry: poll ? 3 : false, // Retry failed requests when polling
  });
}

// Get analysis history
export function useAnalysisHistory() {
  return useQuery({
    queryKey: ANALYSIS_QUERY_KEYS.history(),
    queryFn: () => analysisApi.getAnalysisHistory(),
    staleTime: 60 * 1000, // History is stable for 1 minute
  });
}
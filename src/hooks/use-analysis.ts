import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { analysisApi } from "@/lib/api";
import { AnalysisJob } from "@/types/api";

export const ANALYSIS_QUERY_KEYS = {
  all: ["analysis"] as const,
  status: (jobId: string) => [...ANALYSIS_QUERY_KEYS.all, "status", jobId] as const,
  result: (jobId: string) => [...ANALYSIS_QUERY_KEYS.all, "result", jobId] as const,
  history: () => [...ANALYSIS_QUERY_KEYS.all, "history"] as const,
};

// Create analysis mutation
export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      baselineFile,
      renewalFile,
    }: {
      baselineFile: File;
      renewalFile: File;
    }) => analysisApi.createAnalysis(baselineFile, renewalFile),
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
      // Poll every 3 seconds if status is processing
      if (query.state.data?.status === "processing") {
        return 3000;
      }
      // Stop polling if completed or failed
      return false;
    },
    refetchIntervalInBackground: true,
  });
}

// Get analysis result
export function useAnalysisResult(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ANALYSIS_QUERY_KEYS.result(jobId),
    queryFn: () => analysisApi.getAnalysisResult(jobId),
    enabled: enabled && !!jobId,
    staleTime: 5 * 60 * 1000, // Results are stable for 5 minutes
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
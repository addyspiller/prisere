import { AnalysisJob, AnalysisResult } from "@/types/api";

// Use relative URL in development for MSW to work
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/v1' 
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🔥 API: Making request to:', url);
  console.log('🔥 API: API_BASE_URL:', API_BASE_URL);
  console.log('🔥 API: endpoint:', endpoint);
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred"
    );
  }
}

export const analysisApi = {
  // Create a new analysis job
  createAnalysis: async (
    baselineFile: File,
    renewalFile: File
  ): Promise<AnalysisJob> => {
    const formData = new FormData();
    formData.append("baseline_file", baselineFile);
    formData.append("renewal_file", renewalFile);

    return apiRequest<AnalysisJob>("/analysis", {
      method: "POST",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  },

  // Get analysis job status
  getAnalysisStatus: async (jobId: string): Promise<AnalysisJob> => {
    return apiRequest<AnalysisJob>(`/analysis/${jobId}`);
  },

  // Get analysis results
  getAnalysisResult: async (jobId: string): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>(`/analysis/${jobId}/result`);
  },

  // Get user's analysis history
  getAnalysisHistory: async (): Promise<AnalysisJob[]> => {
    return apiRequest<AnalysisJob[]>("/analysis/history");
  },
};
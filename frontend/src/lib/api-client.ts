"use client";

import { useAuth } from "@clerk/nextjs";
import { analysisApi as baseAnalysisApi, ApiError } from "./api";

// Create a custom hook that wraps the API with authentication
export function useAuthenticatedApi() {
  const { getToken } = useAuth();

  // Wrap the fetch function to include auth token
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  // Override global fetch for API calls
  const originalFetch = global.fetch;
  global.fetch = authenticatedFetch as any;

  // Return the API object (it will now use authenticated fetch)
  const api = baseAnalysisApi;

  // Restore original fetch
  global.fetch = originalFetch;

  // Return wrapped API methods that use authenticated fetch
  return {
    createAnalysis: async (baselineFile: File, renewalFile: File) => {
      const token = await getToken();
      const formData = new FormData();
      formData.append("baseline_file", baselineFile);
      formData.append("renewal_file", renewalFile);

      const response = await fetch("/v1/analysis", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return response.json();
    },

    getAnalysisStatus: async (jobId: string) => {
      const token = await getToken();
      
      const response = await fetch(`/v1/analysis/${jobId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return response.json();
    },

    getAnalysisResult: async (jobId: string) => {
      const token = await getToken();
      
      const response = await fetch(`/v1/analysis/${jobId}/result`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return response.json();
    },

    getAnalysisHistory: async () => {
      const token = await getToken();
      
      const response = await fetch("/v1/analysis/history", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return response.json();
    },
  };
}
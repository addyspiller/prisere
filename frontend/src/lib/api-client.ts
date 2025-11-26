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
    uploadFiles: async (baselineFile: File, renewalFile: File) => {
      const token = await getToken();
      
      // Upload baseline file
      const baselineInitResponse = await fetch("/v1/uploads/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          file_type: "application/pdf",
          filename: baselineFile.name,
        }),
      });

      if (!baselineInitResponse.ok) {
        const errorData = await baselineInitResponse.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Failed to initialize baseline upload`,
          baselineInitResponse.status,
          errorData.code
        );
      }

      const baselineInit = await baselineInitResponse.json();

      // Upload baseline to S3
      const baselineFormData = new FormData();
      Object.entries(baselineInit.fields).forEach(([key, value]) => {
        baselineFormData.append(key, value as string);
      });
      baselineFormData.append("file", baselineFile);

      const baselineS3Response = await fetch(baselineInit.upload_url, {
        method: "POST",
        body: baselineFormData,
      });

      if (!baselineS3Response.ok) {
        throw new ApiError(
          "Failed to upload baseline file to S3",
          baselineS3Response.status
        );
      }

      // Upload renewal file
      const renewalInitResponse = await fetch("/v1/uploads/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          file_type: "application/pdf",
          filename: renewalFile.name,
        }),
      });

      if (!renewalInitResponse.ok) {
        const errorData = await renewalInitResponse.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Failed to initialize renewal upload`,
          renewalInitResponse.status,
          errorData.code
        );
      }

      const renewalInit = await renewalInitResponse.json();

      // Upload renewal to S3
      const renewalFormData = new FormData();
      Object.entries(renewalInit.fields).forEach(([key, value]) => {
        renewalFormData.append(key, value as string);
      });
      renewalFormData.append("file", renewalFile);

      const renewalS3Response = await fetch(renewalInit.upload_url, {
        method: "POST",
        body: renewalFormData,
      });

      if (!renewalS3Response.ok) {
        throw new ApiError(
          "Failed to upload renewal file to S3",
          renewalS3Response.status
        );
      }

      return {
        baseline_s3_key: baselineInit.s3_key,
        renewal_s3_key: renewalInit.s3_key,
      };
    },

    createAnalysis: async (
      baseline_s3_key: string,
      renewal_s3_key: string,
      metadata?: { company_name?: string; policy_type?: string }
    ) => {
      const token = await getToken();
      
      const response = await fetch("/v1/analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          baseline_s3_key,
          renewal_s3_key,
          metadata_company_name: metadata?.company_name,
          metadata_policy_type: metadata?.policy_type,
        }),
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
      
      const response = await fetch(`/v1/analyses/${jobId}/status`, {
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
      
      const response = await fetch(`/v1/analyses/${jobId}/result`, {
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
      
      const response = await fetch("/v1/analyses", {
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
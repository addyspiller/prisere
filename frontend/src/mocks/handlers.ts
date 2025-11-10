import { http, HttpResponse } from "msw";
import { mockAnalysisResult } from "./analysis-data";
import { AnalysisJob, AnalysisResult } from "@/types/api";

// Mock database to store analysis jobs
const analysisJobs: Record<string, AnalysisJob> = {};
let nextJobId = 1;

// Add some sample data for demo purposes
const sampleJobs: AnalysisJob[] = [
  {
    job_id: "demo-job-1",
    status: "completed",
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    baseline_filename: "current-policy-2024.pdf",
    renewal_filename: "renewal-quote-2025.pdf",
  },
  {
    job_id: "demo-job-2", 
    status: "completed",
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    baseline_filename: "business-insurance-current.pdf",
    renewal_filename: "business-insurance-renewal.pdf",
  },
  {
    job_id: "demo-job-3",
    status: "processing",
    created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    updated_at: new Date(Date.now() - 300000).toISOString(),
    baseline_filename: "liability-policy-2024.pdf",
    renewal_filename: "liability-renewal-2025.pdf",
    estimated_completion_time: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
  },
  {
    job_id: "demo-job-4",
    status: "failed",
    created_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    updated_at: new Date(Date.now() - 604800000).toISOString(),
    baseline_filename: "corrupted-file.pdf",
    renewal_filename: "renewal-file.pdf",
    error_message: "Unable to parse baseline PDF file",
  },
];

// Initialize with sample data
console.log('🔥 MSW: Initializing sample data...');
sampleJobs.forEach(job => {
  analysisJobs[job.job_id] = job;
  console.log('🔥 MSW: Added job:', job.job_id);
});
nextJobId = 5;
console.log('🔥 MSW: Sample data initialized. Total jobs:', Object.keys(analysisJobs).length);

console.log('🔥 MSW: Handlers module loaded, registering handlers...');

export const handlers = [
  // Analysis history endpoint - MUST come before the general analysis/{jobId} pattern
  http.get('/v1/analysis/history', ({ request }) => {
    console.log('🔥 MSW: HISTORY handler called!');
    console.log('🔥 MSW: request.url:', request.url);
    console.log('🔥 MSW: analysisJobs object:', analysisJobs);
    console.log('🔥 MSW: Object.keys(analysisJobs):', Object.keys(analysisJobs));
    
    const history = Object.values(analysisJobs).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log('🔥 MSW: history array:', history);
    console.log('🔥 MSW: returning response with', history.length, 'items');

    return HttpResponse.json(history);
  }),

  // Create analysis
  http.post('/v1/analysis', async ({ request }) => {
    const formData = await request.formData();
    const baselineFile = formData.get("baseline_file") as File;
    const renewalFile = formData.get("renewal_file") as File;

    if (!baselineFile || !renewalFile) {
      return HttpResponse.json(
        { message: "Both baseline_file and renewal_file are required" },
        { status: 400 }
      );
    }

    const jobId = `mock-job-${nextJobId++}`;
    const job: AnalysisJob = {
      job_id: jobId,
      status: "processing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      baseline_filename: baselineFile.name,
      renewal_filename: renewalFile.name,
      estimated_completion_time: new Date(Date.now() + 120000).toISOString(), // 2 minutes from now
    };

    analysisJobs[jobId] = job;

    // Simulate processing -> completed after 15 seconds
    setTimeout(() => {
      if (analysisJobs[jobId]) {
        analysisJobs[jobId] = {
          ...analysisJobs[jobId],
          status: "completed",
          updated_at: new Date().toISOString(),
        };
      }
    }, 15000);

    return HttpResponse.json(job, { status: 201 });
  }),

  // Get analysis status
  http.get('/v1/analysis/:jobId', ({ params, request }) => {
    console.log('🔥 MSW: STATUS handler called!');
    console.log('🔥 MSW: request.url:', request.url);
    
    // Get jobId from params
    const jobId = params.jobId as string;
    const job = analysisJobs[jobId];
    
    console.log('🔥 MSW: STATUS jobId extracted:', jobId);
    console.log('🔥 MSW: STATUS job found:', job);

    if (!job) {
      console.log('🔥 MSW: STATUS Job not found, returning 404');
      return HttpResponse.json(
        { message: "Analysis job not found" },
        { status: 404 }
      );
    }

    console.log('🔥 MSW: STATUS Returning job:', job);
    return HttpResponse.json(job);
  }),

  // Get analysis result
  http.get('/v1/analysis/:jobId/result', ({ params, request }) => {
    console.log('🔥 MSW: RESULT handler called!');
    console.log('🔥 MSW: request.url:', request.url);
    console.log('🔥 MSW: params:', params);
    console.log('🔥 MSW: Available jobs:', Object.keys(analysisJobs));
    
    // Get jobId from params
    const jobId = params.jobId as string;
    console.log('🔥 MSW: Looking for jobId:', jobId);
    const job = analysisJobs[jobId];
    console.log('🔥 MSW: Job found?', !!job, job);
    
    console.log('🔥 MSW: jobId extracted:', jobId);
    console.log('🔥 MSW: job found:', job);

    if (!job) {
      console.log('🔥 MSW: Job not found, returning 404');
      return HttpResponse.json(
        { message: "Analysis job not found" },
        { status: 404 }
      );
    }

    if (job.status !== "completed") {
      console.log('🔥 MSW: Job not completed, returning 400');
      return HttpResponse.json(
        { message: "Analysis is not yet completed" },
        { status: 400 }
      );
    }

    console.log('🔥 MSW: Returning mock analysis result');
    const result: AnalysisResult = {
      ...mockAnalysisResult,
      job_id: jobId,
    };

    return HttpResponse.json(result);
  }),
  
  // Debug handler to see all requests
  http.all('*', ({ request }) => {
    console.log('🔥 MSW: Request intercepted -', request.method, request.url);
    // Pass through the request
    return;
  }),
];
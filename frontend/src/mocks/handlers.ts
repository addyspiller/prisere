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

// Mock S3 uploads storage
const mockS3Uploads: Record<string, { filename: string; uploaded: boolean }> = {};

export const handlers = [
  // Initialize upload - returns mock presigned URL and S3 key
  http.post('/v1/uploads/init', async ({ request }) => {
    console.log('🔥 MSW: UPLOAD INIT handler called!');
    const body = await request.json() as { file_type: string; filename: string };
    
    // Generate mock S3 key
    const timestamp = Date.now();
    const s3Key = `uploads/test_user_123/${timestamp}/${body.filename}`;
    
    // Store for later verification
    mockS3Uploads[s3Key] = { filename: body.filename, uploaded: false };
    
    console.log('🔥 MSW: Generated S3 key:', s3Key);
    
    // Return mock presigned upload response
    return HttpResponse.json({
      upload_url: 'https://mock-s3.amazonaws.com/mock-bucket',
      fields: {
        key: s3Key,
        'Content-Type': body.file_type,
        policy: 'mock-policy',
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': 'mock-credential',
        'x-amz-date': new Date().toISOString(),
        'x-amz-signature': 'mock-signature',
      },
      s3_key: s3Key,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      max_file_size_mb: 25,
    });
  }),

  // Mock S3 upload (intercept direct S3 uploads)
  http.post('https://mock-s3.amazonaws.com/mock-bucket', async ({ request }) => {
    console.log('🔥 MSW: S3 UPLOAD handler called!');
    const formData = await request.formData();
    const s3Key = formData.get('key') as string;
    
    if (s3Key && mockS3Uploads[s3Key]) {
      mockS3Uploads[s3Key].uploaded = true;
      console.log('🔥 MSW: File uploaded to S3:', s3Key);
    }
    
    // S3 returns 204 No Content on successful upload
    return new HttpResponse(null, { status: 204 });
  }),

  // List all analyses endpoint - MUST come before the general analyses/{jobId} pattern
  http.get('/v1/analyses', ({ request }) => {
    console.log('🔥 MSW: LIST ANALYSES handler called!');
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

  // Create analysis - now expects JSON with S3 keys
  http.post('/v1/analyses', async ({ request }) => {
    console.log('🔥 MSW: CREATE ANALYSIS handler called!');
    const body = await request.json() as {
      baseline_s3_key: string;
      renewal_s3_key: string;
      metadata_company_name?: string;
      metadata_policy_type?: string;
    };

    console.log('🔥 MSW: Request body:', body);

    if (!body.baseline_s3_key || !body.renewal_s3_key) {
      return HttpResponse.json(
        { message: "Both baseline_s3_key and renewal_s3_key are required" },
        { status: 422 }
      );
    }

    // Extract filenames from S3 keys
    const baselineFilename = body.baseline_s3_key.split('/').pop() || 'unknown.pdf';
    const renewalFilename = body.renewal_s3_key.split('/').pop() || 'unknown.pdf';

    const jobId = `mock-job-${nextJobId++}`;
    const job: AnalysisJob = {
      job_id: jobId,
      status: "processing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      baseline_filename: baselineFilename,
      renewal_filename: renewalFilename,
      estimated_completion_time: new Date(Date.now() + 120000).toISOString(), // 2 minutes from now
    };

    analysisJobs[jobId] = job;

    console.log('🔥 MSW: Created analysis job:', jobId);

    // Simulate processing -> completed after 15 seconds
    setTimeout(() => {
      if (analysisJobs[jobId]) {
        analysisJobs[jobId] = {
          ...analysisJobs[jobId],
          status: "completed",
          updated_at: new Date().toISOString(),
        };
        console.log('🔥 MSW: Job completed:', jobId);
      }
    }, 15000);

    return HttpResponse.json(job, { status: 201 });
  }),

  // Get analysis status
  http.get('/v1/analyses/:jobId/status', ({ params, request }) => {
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
  http.get('/v1/analyses/:jobId/result', ({ params, request }) => {
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
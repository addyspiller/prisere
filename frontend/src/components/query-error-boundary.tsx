"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "./error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface QueryErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function QueryErrorFallback({ error, resetErrorBoundary }: QueryErrorFallbackProps) {
  const isNetworkError = error.message.includes("fetch") || error.message.includes("network");
  const isApiError = error.name === "ApiError";

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">
            {isNetworkError ? "Connection Error" : "Request Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {isNetworkError
              ? "Unable to connect to our servers. Please check your internet connection."
              : isApiError
              ? error.message
              : "An unexpected error occurred while processing your request."}
          </p>
          
          {process.env.NODE_ENV === "development" && (
            <details className="bg-gray-100 p-3 rounded text-sm">
              <summary className="cursor-pointer font-medium">
                Error Details
              </summary>
              <pre className="mt-2 text-xs overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button onClick={resetErrorBoundary}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface Props {
  children: React.ReactNode;
}

export function QueryErrorBoundary({ children }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallback={({ error, resetErrorBoundary }) => (
            <QueryErrorFallback
              error={error}
              resetErrorBoundary={() => {
                reset();
                resetErrorBoundary();
              }}
            />
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
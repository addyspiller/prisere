"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadCardProps {
  title: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export function FileUploadCard({
  title,
  description,
  file,
  onFileSelect,
  onFileRemove,
}: FileUploadCardProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError("File is too large. Maximum size is 10MB.");
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Invalid file type. Please upload a PDF.");
        } else {
          setError("Invalid file. Please upload a PDF under 10MB.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    else return Math.round(bytes / 1048576) + " MB";
  };

  return (
    <Card className={cn("overflow-hidden", error && "border-red-500")}>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
          {description}
        </p>

        {!file ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-prisere-maroon bg-prisere-maroon/5"
                : "border-gray-300 hover:border-gray-400",
              error && "border-red-500 bg-red-50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className={cn(
              "mx-auto h-12 w-12 mb-4",
              isDragActive ? "text-prisere-maroon" : "text-gray-400"
            )} />
            <p className="text-sm text-gray-700 font-medium mb-2">
              {isDragActive
                ? "Drop your PDF here"
                : "Drag and drop your PDF here"}
            </p>
            <p className="text-xs text-gray-500 mb-4">or</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-prisere-maroon text-prisere-maroon hover:bg-prisere-maroon hover:text-white"
              onClick={(e) => e.preventDefault()}
            >
              Browse Files
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              PDF files only, up to 10MB
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <FileText className="h-8 w-8 text-prisere-maroon flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onFileRemove}
                className="text-gray-400 hover:text-gray-600 -mt-1 -mr-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
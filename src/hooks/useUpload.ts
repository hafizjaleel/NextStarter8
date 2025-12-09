import { useState, useCallback } from 'react';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  size: number;
  type: string;
}

export interface UseUploadOptions {
  maxFileSize?: number; // in bytes, default 10MB
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    async (files: File | File[]): Promise<UploadedFile[]> => {
      try {
        setUploading(true);
        setError(null);

        const fileArray = Array.isArray(files) ? files : [files];

        // Validate files
        const maxSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
        for (const file of fileArray) {
          if (file.size > maxSize) {
            throw new Error(
              `File "${file.name}" exceeds maximum size of ${maxSize / 1024 / 1024}MB`,
            );
          }
        }

        // Create FormData
        const formData = new FormData();
        fileArray.forEach((file) => {
          formData.append('files', file);
        });

        // Upload files
        const response = await fetch('/api/v1/app/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Parse response - expects: { files: [{ id, name, url, size, type }, ...] }
        const uploadedFiles: UploadedFile[] = (data.files || []).map((file: any) => {
          const uploadedFile: UploadedFile = {
            id: file.id || file.fileId || '',
            name: file.name || file.filename || '',
            url: file.url || file.path || '',
            size: file.size || 0,
            type: file.type || file.mimetype || '',
          };

          // Generate preview URL for images
          if (uploadedFile.type.startsWith('image/')) {
            uploadedFile.previewUrl = uploadedFile.url;
          }

          return uploadedFile;
        });

        if (options.onSuccess) {
          options.onSuccess(uploadedFiles);
        }

        return uploadedFiles;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');
        setError(error);
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      } finally {
        setUploading(false);
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    upload,
    uploading,
    error,
    reset,
  };
}

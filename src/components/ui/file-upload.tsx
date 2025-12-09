'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { useUpload, type UploadedFile } from '@/hooks/useUpload';

interface FileUploadProps {
  onFilesSelected?: (files: UploadedFile[]) => void;
  multiple?: boolean;
  maxFileSize?: number;
  accept?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

export function FileUpload({
  onFilesSelected,
  multiple = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  accept = '*/*',
  disabled = false,
  showPreview = true,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const { upload, uploading, error, reset } = useUpload({ maxFileSize });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);
      const filesToProcess = multiple ? fileArray : [fileArray[0]];

      try {
        const uploadedFiles = await upload(filesToProcess);
        setSelectedFiles((prev) =>
          multiple ? [...prev, ...uploadedFiles] : uploadedFiles,
        );
        if (onFilesSelected) {
          onFilesSelected(multiple ? [...selectedFiles, ...uploadedFiles] : uploadedFiles);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    },
    [upload, multiple, onFilesSelected, selectedFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!disabled && !uploading && e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, uploading, processFiles],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles],
  );

  const handleClick = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileId: string) => {
    const newFiles = selectedFiles.filter((f) => f.id !== fileId);
    setSelectedFiles(newFiles);
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" strokeWidth={2} />;
    }
    return <File className="h-5 w-5 text-slate-400" strokeWidth={2} />;
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative rounded-xl border-2 border-dashed transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} p-8`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div
            className={`rounded-full p-3 transition-colors ${
              isDragging ? 'bg-emerald-100' : 'bg-slate-100'
            }`}
          >
            <Upload
              className={`h-6 w-6 transition-colors ${
                isDragging ? 'text-emerald-600' : 'text-slate-600'
              }`}
              strokeWidth={2}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              {uploading ? 'Uploading files...' : 'Drag and drop files here'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              or click to select files
            </p>
          </div>

          {maxFileSize && (
            <p className="text-xs text-slate-400">
              Max file size: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error.message}</p>
          <button
            onClick={reset}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {selectedFiles.length > 0 && showPreview && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="rounded-lg border border-slate-100 bg-white overflow-hidden hover:shadow-md transition"
              >
                {file.previewUrl && (
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)}KB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    disabled={uploading}
                    className="w-full rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <X className="h-3 w-3" strokeWidth={2} />
                      Remove
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

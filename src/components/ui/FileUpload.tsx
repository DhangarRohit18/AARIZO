import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, FileText, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export interface FileUploadProps {
  label?: string;
  category?: 'tickets' | 'kyc' | 'ads' | 'receipts' | 'avatar' | 'general';
  accept?: string;
  maxSizeMB?: number;
  currentUrl?: string;
  onUploadSuccess: (url: string, filename: string) => void;
  onRemove?: () => void;
  showCameraOption?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload Document or Photo',
  category = 'general',
  accept = 'image/*,application/pdf',
  maxSizeMB = 10,
  currentUrl,
  onUploadSuccess,
  onRemove,
  showCameraOption = true,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setError(null);

    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds limit (${maxSizeMB}MB). Please choose a smaller file.`);
      return;
    }

    setIsUploading(true);
    try {
      // Local preview if image
      if (file.type.startsWith('image/')) {
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
      } else {
        setPreviewUrl(null);
      }
      setUploadedName(file.name);

      // Upload to live PostgreSQL backend uploads directory
      const result = await apiClient.uploadFile(file, category);
      if (result.success && result.url) {
        setPreviewUrl(result.fullUrl || result.url);
        setUploadedName(result.filename);
        onUploadSuccess(result.fullUrl || result.url, result.filename);
      } else {
        throw new Error('Upload response indicated failure');
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      setError(err?.message || 'Failed to upload file. Please try again.');
      setPreviewUrl(currentUrl || null);
      setUploadedName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setUploadedName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {showCameraOption && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Upload Zone or Preview */}
      {previewUrl || uploadedName ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 p-3 transition-all">
          <div className="flex items-center gap-3">
            {previewUrl && (previewUrl.startsWith('http') || previewUrl.startsWith('blob:') || previewUrl.startsWith('/uploads')) ? (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-14 h-14 rounded-xl object-cover border border-emerald-200 dark:border-emerald-800 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-emerald-600" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Uploaded Successfully</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                {uploadedName || 'Document Attached'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-200 transition-colors shrink-0"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-4 transition-all flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'border-[#176B91] bg-sky-50 dark:bg-sky-950/30'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-[#176B91] hover:bg-slate-50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="w-8 h-8 text-[#176B91] animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Uploading to Server...
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Storing in PostgreSQL real-time storage</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-[#EBF3F7] dark:bg-slate-700 flex items-center justify-center text-[#176B91] dark:text-[#83CBEA] mb-2 shadow-xs">
                <Upload className="w-5 h-5" />
              </div>

              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                Click or drag &amp; drop file here
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                JPG, PNG, PDF up to {maxSizeMB}MB
              </p>

              {/* Mobile Camera Quick-Action */}
              {showCameraOption && (
                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 w-full justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#176B91]" />
                    <span>Take Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#176B91]" />
                    <span>Gallery</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

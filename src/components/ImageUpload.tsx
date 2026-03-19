import { useState, useCallback } from 'react';
import { X, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
import { uploadImage, type ImageType } from '../firebase/storage';

interface ImageUploadProps {
  txnId: string;
  imageType: ImageType;
  existingUrl?: string;
  onUpload: (url: string, path?: string) => void;
  onDelete?: () => void;
  label: string;
  required?: boolean;
  aspectRatio?: 'square' | 'video';
}

export default function ImageUpload({
  txnId,
  imageType,
  existingUrl,
  onUpload,
  onDelete,
  label,
  required = false,
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>(existingUrl || '');

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Max size is 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');

    try {
      const result = await uploadImage(file, txnId, imageType);
      onUpload(result.url, result.path);
    } catch (err) {
      setError('Failed to upload image');
      setPreview(existingUrl || '');
    } finally {
      setUploading(false);
    }
  }, [txnId, imageType, existingUrl, onUpload]);

  const handleDelete = async () => {
    if (!preview || !existingUrl) return;

    setUploading(true);
    try {
      if (onDelete) {
        onDelete();
      }
      setPreview('');
      onUpload('');
    } catch (err) {
      setError('Failed to delete image');
    } finally {
      setUploading(false);
    }
  };

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className={`relative ${aspectClass} rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden`}>
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {preview ? (
          <>
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleDelete}
              disabled={uploading}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="p-3 bg-gray-100 rounded-full mb-2">
              {imageType === 'device' ? (
                <Camera className="w-8 h-8 text-gray-400" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <span className="text-sm text-gray-500">Tap to upload</span>
            <input
              type="file"
              accept="image/*"
              capture={imageType === 'selfie' ? 'user' : 'environment'}
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  txnId: string;
  imageType: 'device';
  existingUrls: string[];
  onUpload: (urls: string[], paths?: string[]) => void;
  label: string;
  minImages?: number;
  maxImages?: number;
}

export function MultiImageUpload({
  txnId,
  imageType,
  existingUrls = [],
  onUpload,
  label,
  minImages = 2,
  maxImages = 5,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(existingUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - previews.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newPreviews = filesToUpload.map((file) => {
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    setUploading(true);
    setError('');

    try {
      const previewUrls = await Promise.all(newPreviews);
      const uploadPromises = filesToUpload.map((file, index) =>
        uploadImage(file, txnId, imageType, previews.length + index)
      );
      const uploadResults = await Promise.all(uploadPromises);
      const newUrls = uploadResults.map((r) => r.url);
      const newPaths = uploadResults.map((r) => r.path);
      const updatedPreviews = [...previews, ...previewUrls];
      const updatedUrls = [...previews, ...newUrls];
      setPreviews(updatedPreviews);
      onUpload(updatedUrls, newPaths);
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [txnId, imageType, previews, maxImages, onUpload]);

  const handleRemove = async (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newUrls = newPreviews;
    setPreviews(newPreviews);
    onUpload(newUrls);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <span className="text-xs text-gray-500">
          {previews.length}/{maxImages} (min: {minImages})
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {previews.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={url}
              alt={`Device ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
              {index + 1}
            </span>
          </div>
        ))}

        {previews.length < maxImages && (
          <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {previews.length < minImages && (
        <p className="text-xs text-orange-500">
          Please upload at least {minImages} device photos
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

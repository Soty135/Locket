import { useState } from 'react';
import { X, Upload, Trash2, Check } from 'lucide-react';
import { uploadImage, deleteImage, type ImageType } from '../firebase/storage';
import { updateLoanImages } from '../utils/loanService';
import type { LoanImages } from '../types/loan';

interface ImageEditModalProps {
  txnId: string;
  images: LoanImages | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImageEditModal({ txnId, images, isOpen, onClose, onSuccess }: ImageEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const [idFront, setIdFront] = useState<string | undefined>(images?.idFront);
  const [idBack, setIdBack] = useState<string | undefined>(images?.idBack);
  const [selfie, setSelfie] = useState<string | undefined>(images?.selfie);
  const [devicePhotos, setDevicePhotos] = useState<string[]>(images?.devicePhotos || []);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'idFront' | 'idBack' | 'selfie' | 'devicePhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageTypeMap: Record<string, ImageType> = {
        idFront: 'id_front',
        idBack: 'id_back',
        selfie: 'selfie',
        devicePhoto: 'device',
      };

      const result = await uploadImage(file, txnId, imageTypeMap[field], field === 'devicePhoto' ? devicePhotos.length : undefined);

      if (field === 'idFront') setIdFront(result.url);
      else if (field === 'idBack') setIdBack(result.url);
      else if (field === 'selfie') setSelfie(result.url);
      else if (field === 'devicePhoto') setDevicePhotos((prev) => [...prev, result.url]);

      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDevicePhoto = async (index: number) => {
    const url = devicePhotos[index];
    try {
      const path = url.split('firebasestorage.googleapis.com')[1] || '';
      if (path) {
        await deleteImage(path);
      }
      setDevicePhotos((prev) => prev.filter((_, i) => i !== index));
      setMessage({ type: 'success', text: 'Image deleted successfully!' });
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Failed to delete image.' });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const newImages: LoanImages = {
        idType: images?.idType || 'nin',
        idFront: idFront || '',
        idBack: idBack || '',
        selfie: selfie || '',
        devicePhotos: devicePhotos,
      };
      await updateLoanImages(txnId, newImages);
      setMessage({ type: 'success', text: 'Images saved successfully!' });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save images. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const ImageField = ({ 
    label, 
    value, 
    field 
  }: { 
    label: string; 
    value?: string; 
    field: 'idFront' | 'idBack' | 'selfie';
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {value ? (
          <div className="relative group">
            <img src={value} alt={label} className="w-full h-32 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <label className="cursor-pointer px-3 py-1 bg-white text-gray-800 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-50" title={uploading ? 'Uploading...' : 'Replace image'}>
                <Upload className="w-4 h-4 inline mr-1" />
                Replace
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, field as any)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 relative">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload</p>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, field as any)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-gray-600">
              {txnId}
            </span>
            <span className="text-sm text-gray-500">Edit Images</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {message && (
            <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <ImageField label="ID Front" value={idFront} field="idFront" />
            <ImageField label="ID Back" value={idBack} field="idBack" />
            <ImageField label="Customer Selfie" value={selfie} field="selfie" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Device Photos ({devicePhotos.length}/5)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {devicePhotos.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt={`Device ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteDevicePhoto(index)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      disabled={uploading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {devicePhotos.length < 5 && (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 relative">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add Photo</span>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'devicePhoto')}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

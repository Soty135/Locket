import { useState } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle, Camera, User, CreditCard } from 'lucide-react';
import { createLoan, checkDuplicateHardware, updateLoanImages } from '../utils/loanService';
import { uploadImage } from '../utils/cloudinary';
import { MultiImageUpload } from './ImageUpload';
import type { LoanFormData, HardwareType, HardwareCondition, IdType } from '../types/loan';

interface NewLoanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txnId: string) => void;
}

const hardwareTypes: HardwareType[] = ['phone', 'laptop', 'console'];
const conditions: HardwareCondition[] = ['new', 'good', 'fair', 'poor'];
const idTypes: { value: IdType; label: string }[] = [
  { value: 'nin', label: 'NIN' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
];

export default function NewLoanForm({ isOpen, onClose, onSuccess }: NewLoanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'images'>('form');
  const [txnId, setTxnId] = useState<string>('');
  const [formData, setFormData] = useState<LoanFormData>({
    customer: { name: '', phone: '', email: '', address: '' },
    hardware: { type: 'phone', id: '', brand: '', model: '', condition: 'good' },
    principalAmount: 0,
    interestRate: 0,
    maturityDate: new Date(),
  });

  const [idType, setIdType] = useState<IdType>('nin');
  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [deviceUrls, setDeviceUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const duplicate = await checkDuplicateHardware(formData.hardware.id);
      
      if (duplicate.isDuplicate) {
        setError(`This ${formData.hardware.type === 'phone' ? 'IMEI' : 'Serial Number'} already has an active loan under "${duplicate.existingCustomer}" (TXN: ${duplicate.existingLoanId}). Please mark the existing loan as paid first.`);
        setLoading(false);
        return;
      }
      
      const newTxnId = await createLoan(formData);
      setTxnId(newTxnId);
      setStep('images');
      setLoading(false);
    } catch (err) {
      setError('Failed to create loan. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    type: 'id_front' | 'id_back' | 'selfie',
    url: string
  ) => {
    if (type === 'id_front') setIdFrontUrl(url);
    if (type === 'id_back') setIdBackUrl(url);
    if (type === 'selfie') setSelfieUrl(url);
  };

  const handleDeviceUpload = (urls: string[]) => {
    setDeviceUrls(urls);
  };

  const handleSkipImages = () => {
    onSuccess(txnId);
    handleClose();
  };

  const handleComplete = async () => {
    setUploadingImages(true);
    setImageError('');

    try {
      if (idFrontUrl || idBackUrl || selfieUrl || deviceUrls.length > 0) {
        await updateLoanImages(txnId, {
          devicePhotos: deviceUrls,
          idType,
          idFront: idFrontUrl,
          idBack: idBackUrl,
          selfie: selfieUrl,
        });
      }
      onSuccess(txnId);
      handleClose();
    } catch (err) {
      setImageError('Failed to save images. Loan created without images.');
      console.error(err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customer: { name: '', phone: '', email: '', address: '' },
      hardware: { type: 'phone', id: '', brand: '', model: '', condition: 'good' },
      principalAmount: 0,
      interestRate: 0,
      maturityDate: new Date(),
    });
    setIdType('nin');
    setIdFrontUrl('');
    setIdBackUrl('');
    setSelfieUrl('');
    setDeviceUrls([]);
    setError('');
    setStep('form');
    setTxnId('');
    onClose();
  };

  const updateCustomer = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customer: { ...prev.customer, [field]: value },
    }));
  };

  const updateHardware = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      hardware: { ...prev.hardware, [field]: value },
    }));
  };

  const setMaturityDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    setFormData((prev) => ({ ...prev, maturityDate: date }));
  };

  const canSubmitForm = formData.customer.name && formData.customer.phone && 
    formData.hardware.id && formData.hardware.brand && formData.hardware.model &&
    formData.principalAmount > 0 && formData.interestRate > 0;

  const canCompleteImages = idFrontUrl && idBackUrl && selfieUrl && deviceUrls.length >= 2;

  if (step === 'images') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
          <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upload Documents</h2>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Loan Created!</p>
                <p className="text-sm text-blue-700">TXN: {txnId}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> ID verification and device photos are required. You can also add them later via the Edit option.
              </p>
            </div>

            {imageError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {imageError}
              </div>
            )}

            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                ID Verification (Required)
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                <div className="flex flex-wrap gap-2">
                  {idTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setIdType(type.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        idType === type.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ImageUploadInput
                  txnId={txnId}
                  imageType="id_front"
                  label="ID Front"
                  required
                  onUpload={handleImageUpload}
                />
                <ImageUploadInput
                  txnId={txnId}
                  imageType="id_back"
                  label="ID Back"
                  required
                  onUpload={handleImageUpload}
                />
              </div>

              <div className="mt-4">
                <ImageUploadInput
                  txnId={txnId}
                  imageType="selfie"
                  label="Customer Selfie (with ID visible)"
                  required
                  onUpload={handleImageUpload}
                />
              </div>
            </section>

            <section>
              <MultiImageUpload
                txnId={txnId}
                imageType="device"
                existingUrls={deviceUrls}
                onUpload={handleDeviceUpload}
                label="Device Photos (Required - 2 to 5 photos)"
                minImages={2}
                maxImages={5}
              />
            </section>
          </div>

          <div className="flex-shrink-0 p-4 sm:p-6 pt-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkipImages}
                disabled={uploadingImages}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Skip for Now
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={uploadingImages || !canCompleteImages}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingImages && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploadingImages ? 'Saving...' : 'Save & Complete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">New Loan</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Cannot create loan</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customer.name}
                  onChange={(e) => updateCustomer('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.customer.phone}
                  onChange={(e) => updateCustomer('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.customer.email}
                  onChange={(e) => updateCustomer('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.customer.address}
                  onChange={(e) => updateCustomer('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Device Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  required
                  value={formData.hardware.type}
                  onChange={(e) => updateHardware('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {hardwareTypes.map((type) => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.hardware.type === 'phone' ? 'IMEI *' : 'Serial Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.hardware.id}
                  onChange={(e) => updateHardware('id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <input
                  type="text"
                  required
                  value={formData.hardware.brand}
                  onChange={(e) => updateHardware('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <input
                  type="text"
                  required
                  value={formData.hardware.model}
                  onChange={(e) => updateHardware('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                <select
                  required
                  value={formData.hardware.condition}
                  onChange={(e) => updateHardware('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>{condition.charAt(0).toUpperCase() + condition.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Terms</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount (₦) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.principalAmount || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, principalAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Interest Rate (%) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.interestRate || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Maturity Date *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[30, 60, 90].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setMaturityDate(days)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {days} days
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  required
                  value={formData.maturityDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maturityDate: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>
        </form>

        <div className="flex-shrink-0 p-4 sm:p-6 pt-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-loan-form"
              onClick={handleSubmit}
              disabled={loading || !canSubmitForm}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Loan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ImageUploadInputProps {
  txnId: string;
  imageType: 'id_front' | 'id_back' | 'selfie';
  label: string;
  required?: boolean;
  onUpload: (type: 'id_front' | 'id_back' | 'selfie', url: string) => void;
}

function ImageUploadInput({ txnId, imageType, label, required, onUpload }: ImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');

    try {
      const result = await uploadImage(file, txnId, imageType);
      onUpload(imageType, result.url);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { setPreview(''); onUpload(imageType, ''); }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-100">
            <CreditCard className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Tap to upload</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

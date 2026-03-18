import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { createLoan, checkDuplicateHardware } from '../utils/loanService';
import type { LoanFormData, HardwareType, HardwareCondition } from '../types/loan';

interface NewLoanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txnId: string) => void;
}

const hardwareTypes: HardwareType[] = ['phone', 'laptop', 'console'];
const conditions: HardwareCondition[] = ['new', 'good', 'fair', 'poor'];

export default function NewLoanForm({ isOpen, onClose, onSuccess }: NewLoanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<LoanFormData>({
    customer: { name: '', phone: '', email: '', address: '' },
    hardware: { type: 'phone', id: '', brand: '', model: '', condition: 'good' },
    principalAmount: 0,
    interestRate: 0,
    maturityDate: new Date(),
  });

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
      
      const txnId = await createLoan(formData);
      onSuccess(txnId);
      handleClose();
    } catch (err) {
      setError('Failed to create loan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
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
    setError('');
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">New Loan</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer.name}
                  onChange={(e) => updateCustomer('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customer.phone}
                  onChange={(e) => updateCustomer('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.customer.email}
                  onChange={(e) => updateCustomer('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  required
                  value={formData.hardware.type}
                  onChange={(e) => updateHardware('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {hardwareTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
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
                  placeholder={formData.hardware.type === 'phone' ? '123456789012345' : 'ABC123XYZ'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hardware.brand}
                  onChange={(e) => updateHardware('brand', e.target.value)}
                  placeholder="Apple, Samsung, Sony..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hardware.model}
                  onChange={(e) => updateHardware('model', e.target.value)}
                  placeholder="iPhone 15, Galaxy S24..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition *
                </label>
                <select
                  required
                  value={formData.hardware.condition}
                  onChange={(e) => updateHardware('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Terms</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Amount (₦) *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Interest Rate (%) *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maturity Date *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setMaturityDate(30)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    30 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaturityDate(60)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    60 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaturityDate(90)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    90 days
                  </button>
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

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

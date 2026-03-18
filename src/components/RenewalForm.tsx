import { useState } from 'react';
import { X, Loader2, RotateCcw } from 'lucide-react';
import { renewLoan } from '../utils/loanService';
import type { Loan } from '../types/loan';

interface RenewalFormProps {
  txnId: string;
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: { previousPrincipal: number; unpaidInterest: number; newPrincipal: number; newMaturityDate: Date }) => void;
}

export default function RenewalForm({ txnId, loan, isOpen, onClose, onSuccess }: RenewalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [months, setMonths] = useState(1);

  if (!isOpen) return null;

  const principal = loan.loan.principalAmount;
  const interestRate = loan.loan.interestRate;

  const calculateUnpaidInterest = () => {
    const now = new Date();
    const maturity = loan.loan.maturityDate.toDate();
    const monthsDiff = Math.max(1, 
      (now.getFullYear() - maturity.getFullYear()) * 12 + 
      (now.getMonth() - maturity.getMonth())
    );
    return Math.round(principal * (interestRate / 100) * monthsDiff * 100) / 100;
  };

  const unpaidInterest = calculateUnpaidInterest();
  const newPrincipal = Math.round((principal + unpaidInterest) * 100) / 100;
  
  const newMaturityDate = new Date();
  newMaturityDate.setMonth(newMaturityDate.getMonth() + months);
  const formattedNewMaturity = newMaturityDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await renewLoan(txnId, months);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to renew loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMonths(1);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Renew Loan</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current Principal:</span>
              <span className="font-medium">{formatCurrency(principal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Unpaid Interest:</span>
              <span className="font-medium text-red-600">{formatCurrency(unpaidInterest)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-gray-500 font-medium">New Principal:</span>
              <span className="font-bold text-lg text-blue-600">{formatCurrency(newPrincipal)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renewal Period
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 6].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    months === m
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m} month{m > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">New Maturity Date:</span>
              <span className="font-bold text-blue-900">{formattedNewMaturity}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
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
              {loading ? 'Processing...' : 'Confirm Renewal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

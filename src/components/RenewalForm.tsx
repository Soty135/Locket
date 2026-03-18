import { useState, useMemo, useEffect } from 'react';
import { X, Loader2, RotateCcw } from 'lucide-react';
import { renewLoan } from '../utils/loanService';
import type { Loan } from '../types/loan';

interface RenewalFormProps {
  txnId: string;
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: { previousPrincipal: number; unpaidInterest: number; renewalFee: number; newPrincipal: number; newMaturityDate: Date }) => void;
}

export default function RenewalForm({ txnId, loan, isOpen, onClose, onSuccess }: RenewalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [renewalFee, setRenewalFee] = useState(500);
  const [newMaturityDate, setNewMaturityDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const originalPrincipal = loan.loan.originalPrincipal || loan.loan.principalAmount;
  const principal = loan.loan.principalAmount;
  const interestRate = loan.loan.interestRate;

  const monthsOverdue = useMemo(() => {
    const now = new Date();
    const maturity = loan.loan.maturityDate.toDate();
    const months = (now.getFullYear() - maturity.getFullYear()) * 12 + (now.getMonth() - maturity.getMonth());
    return Math.max(1, months);
  }, [loan.loan.maturityDate]);

  const unpaidInterest = useMemo(() => {
    return Math.round(originalPrincipal * (interestRate / 100) * monthsOverdue * 100) / 100;
  }, [originalPrincipal, interestRate, monthsOverdue]);

  const newPrincipal = useMemo(() => {
    return Math.round((principal + unpaidInterest + renewalFee) * 100) / 100;
  }, [principal, unpaidInterest, renewalFee]);

  const formattedNewMaturity = useMemo(() => {
    if (!newMaturityDate) return '';
    return new Date(newMaturityDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [newMaturityDate]);

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
      const maturityDateObj = new Date(newMaturityDate);
      const result = await renewLoan(txnId, maturityDateObj, renewalFee);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to renew loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRenewalFee(500);
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setNewMaturityDate(date.toISOString().split('T')[0]);
    setError('');
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 sm:hidden"
        onClick={handleClose}
      />
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
        <div 
          className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Renew Loan</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Original:</span>
              <span className="font-medium">{formatCurrency(originalPrincipal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Current:</span>
              <span className="font-medium">{formatCurrency(principal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rate:</span>
              <span className="font-medium">{interestRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Overdue:</span>
              <span className="font-medium">{monthsOverdue} mo</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="text-gray-500 font-medium">Interest:</span>
              <span className="font-bold text-red-600">{formatCurrency(unpaidInterest)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Maturity Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newMaturityDate}
              onChange={(e) => setNewMaturityDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
              {[7, 14, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    setNewMaturityDate(date.toISOString().split('T')[0]);
                  }}
                  className="px-2 sm:px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  +{days}d
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renewal Fee (₦)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={renewalFee}
              onChange={(e) => setRenewalFee(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
              {[500, 1000, 2000, 5000].map((fee) => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setRenewalFee(fee)}
                  className={`px-2 sm:px-3 py-1 text-xs rounded-lg transition-colors ${
                    renewalFee === fee
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  ₦{fee.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-700">New Total:</span>
              <span className="font-bold text-blue-900 text-lg">{formatCurrency(newPrincipal)}</span>
            </div>
            <div className="text-center">
              <span className="text-xs sm:text-sm text-blue-700">Maturity: </span>
              <span className="font-semibold text-blue-900 text-xs sm:text-sm">{formattedNewMaturity}</span>
            </div>
          </div>
        </form>

        <div className="flex-shrink-0 p-4 sm:p-6 pt-2 sm:pt-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

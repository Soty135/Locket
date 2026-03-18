import { useState, useEffect, useCallback } from 'react';
import { Search, Phone, Laptop, Gamepad2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getActiveLoans, updateLoanStatus, refreshOverdueLoans } from '../utils/loanService';
import type { Loan, LoanStatus } from '../types/loan';

interface LoanSearchProps {
  onViewDetails: (loan: { id: string; data: Loan }) => void;
  refreshTrigger: number;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: Clock },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  paid: { label: 'Paid', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

const hardwareIcons = {
  phone: Phone,
  laptop: Laptop,
  console: Gamepad2,
};

export default function LoanSearch({ onViewDetails, refreshTrigger }: LoanSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loans, setLoans] = useState<Array<{ id: string; data: Loan }>>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      await refreshOverdueLoans();
      const result = await getActiveLoans(page, pageSize, debouncedSearch);
      setLoans(result.loans);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans, refreshTrigger]);

  const handleStatusChange = async (txnId: string, newStatus: LoanStatus) => {
    try {
      await updateLoanStatus(txnId, newStatus);
      loadLoans();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (timestamp: { toDate: () => Date }) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Customer Name, TXN_ID, or IMEI/Serial Number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No active loans found</p>
          {searchTerm && (
            <p className="text-sm mt-1">Try adjusting your search terms</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan) => {
              const status = loan.data.loan.status;
              const StatusIcon = statusConfig[status].icon;
              const HardwareIcon = hardwareIcons[loan.data.hardware.type] || Phone;

              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-lg shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-sm font-semibold text-gray-600">
                      {loan.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[status].label}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <HardwareIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {loan.data.customer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {loan.data.hardware.brand} {loan.data.hardware.model}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {loan.data.hardware.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Principal:</span>
                      <span className="font-medium">
                        {formatCurrency(loan.data.loan.principalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Maturity:</span>
                      <span className="font-medium">
                        {formatDate(loan.data.loan.maturityDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(loan.id, e.target.value as LoanStatus)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="overdue">Overdue</option>
                      <option value="paid">Paid/Released</option>
                    </select>
                    <button
                      onClick={() => onViewDetails(loan)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages} ({totalCount} total)
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { X, Phone, Laptop, Gamepad2, User, Calendar, DollarSign, CreditCard, RotateCcw, Image as ImageIcon } from 'lucide-react';
import type { Loan } from '../types/loan';
import { ImageGrid } from './ImageGallery';

interface LoanDetailsModalProps {
  loan: { id: string; data: Loan } | null;
  isOpen: boolean;
  onClose: () => void;
  onRenew: () => void;
}

const hardwareIcons = {
  phone: Phone,
  laptop: Laptop,
  console: Gamepad2,
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  paid: 'bg-gray-100 text-gray-800',
};

const paymentTypeLabels: Record<string, string> = {
  interest: 'Interest Payment',
  principal: 'Principal Payment',
  renewal: 'Loan Renewal',
  release: 'Final Release',
};

export default function LoanDetailsModal({ loan, isOpen, onClose, onRenew }: LoanDetailsModalProps) {
  if (!isOpen || !loan) return null;

  const HardwareIcon = hardwareIcons[loan.data.hardware.type] || Phone;

  const formatDate = (timestamp: { toDate: () => Date }) => {
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const calculateTotalPayments = () => {
    return loan.data.payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const calculateTotalInterest = () => {
    const principal = loan.data.loan.principalAmount;
    const currentBalance = loan.data.payments.length > 0
      ? loan.data.payments[loan.data.payments.length - 1].balance
      : principal;
    return principal - currentBalance;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-semibold text-gray-600">
              {loan.id}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[loan.data.loan.status]}`}>
              {loan.data.loan.status.charAt(0).toUpperCase() + loan.data.loan.status.slice(1)}
            </span>
            {loan.data.loan.status !== 'paid' && (
              <button
                onClick={onRenew}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Renew
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                <User className="w-5 h-5 text-gray-400" />
                Customer Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{loan.data.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{loan.data.customer.phone}</p>
                </div>
                {loan.data.customer.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{loan.data.customer.email}</p>
                  </div>
                )}
                {loan.data.customer.address && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{loan.data.customer.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                <HardwareIcon className="w-5 h-5 text-gray-400" />
                Device Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{loan.data.hardware.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{loan.data.hardware.type === 'phone' ? 'IMEI' : 'Serial Number'}</p>
                  <p className="font-medium text-gray-900 font-mono">{loan.data.hardware.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Device</p>
                  <p className="font-medium text-gray-900">{loan.data.hardware.brand} {loan.data.hardware.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium text-gray-900 capitalize">{loan.data.hardware.condition}</p>
                </div>
              </div>
            </div>

            {((loan.data.images?.devicePhotos?.length ?? 0) > 0 || loan.data.images?.idFront || loan.data.images?.idBack || loan.data.images?.selfie) && (
              <div className="space-y-4 md:col-span-2">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  Images
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ImageGrid
                    devicePhotos={loan.data.images?.devicePhotos || []}
                    idFront={loan.data.images?.idFront}
                    idBack={loan.data.images?.idBack}
                    selfie={loan.data.images?.selfie}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <DollarSign className="w-5 h-5 text-gray-400" />
              Loan Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-blue-50 rounded-lg p-3 md:p-4 overflow-hidden">
                <p className="text-xs md:text-sm text-blue-600">Principal Amount</p>
                <p className="text-base md:text-lg font-bold text-blue-900 break-all leading-tight">
                  {formatCurrency(loan.data.loan.principalAmount)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 md:p-4 overflow-hidden">
                <p className="text-xs md:text-sm text-purple-600">Interest Rate</p>
                <p className="text-base md:text-lg font-bold text-purple-900 leading-tight">
                  {loan.data.loan.interestRate}%
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 md:p-4 overflow-hidden">
                <p className="text-xs md:text-sm text-green-600">Total Payments</p>
                <p className="text-base md:text-lg font-bold text-green-900 break-all leading-tight">
                  {formatCurrency(calculateTotalPayments())}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 md:p-4 overflow-hidden">
                <p className="text-xs md:text-sm text-orange-600">Total Interest</p>
                <p className="text-base md:text-lg font-bold text-orange-900 break-all leading-tight">
                  {formatCurrency(calculateTotalInterest())}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Maturity Date</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(loan.data.loan.maturityDate)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(loan.data.loan.createdAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Payment History
            </h3>
            {loan.data.payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No payments recorded yet
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Date</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Type</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-medium text-gray-500">Amount</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-medium text-gray-500">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loan.data.payments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 whitespace-nowrap">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900">
                          {paymentTypeLabels[payment.type] || payment.type}
                        </td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 text-right font-medium whitespace-nowrap">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-900 text-right whitespace-nowrap">
                          {formatCurrency(payment.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

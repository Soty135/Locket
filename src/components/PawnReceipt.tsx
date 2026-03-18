import { X, Printer, Copy, Check, CreditCard } from 'lucide-react';
import { useState } from 'react';
import type { Loan } from '../types/loan';

interface PawnReceiptProps {
  txnId: string;
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
}

export default function PawnReceipt({ txnId, loan, isOpen, onClose }: PawnReceiptProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateInterest = () => {
    const principal = loan.loan.principalAmount;
    const rate = loan.loan.interestRate;
    return principal * (rate / 100);
  };

  const calculateTotalPayments = () => {
    return loan.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
  };

  const calculateRemainingBalance = () => {
    if (loan.payments.length === 0) {
      return loan.loan.principalAmount;
    }
    return loan.payments[loan.payments.length - 1].balance;
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      interest: 'Interest',
      principal: 'Principal',
      renewal: 'Renewal',
      release: 'Release',
    };
    return labels[type] || type;
  };

  const handlePrint = () => {
    window.print();
  };

  const hasPayments = loan.payments.length > 0;
  const totalPayments = calculateTotalPayments();
  const remainingBalance = calculateRemainingBalance();

  const hasRenewals = (loan.loan as any).renewalCount > 0;
  const originalPrincipal = loan.loan.originalPrincipal || loan.loan.principalAmount;
  const isRenewed = originalPrincipal !== loan.loan.principalAmount;

  const handleCopy = () => {
    const paymentsInfo = hasPayments
      ? `\nPAYMENT SUMMARY\n-------------\nTotal Payments: ${formatCurrency(totalPayments)}\nRemaining Balance: ${formatCurrency(remainingBalance)}\n\nPAYMENT HISTORY\n--------------\n${loan.payments.map((p, i) => `${i + 1}. ${formatDate(p.date)} - ${getPaymentTypeLabel(p.type)}: ${formatCurrency(p.amount)} (Balance: ${formatCurrency(p.balance)})`).join('\n')}`
      : '';

    const renewalInfo = hasRenewals
      ? `\nRENEWAL INFO\n------------\nRenewal Count: ${(loan.loan as any).renewalCount}`
      : '';

    const receiptText = `
PAWN SHOP RECEIPT / PAWN TICKET
================================

Transaction ID: ${txnId}
Date Issued: ${formatDate(loan.loan.createdAt)}

CUSTOMER INFORMATION
--------------------
Name: ${loan.customer.name}
Phone: ${loan.customer.phone}
${loan.customer.email ? `Email: ${loan.customer.email}` : ''}
${loan.customer.address ? `Address: ${loan.customer.address}` : ''}

DEVICE INFORMATION
------------------
Type: ${loan.hardware.type.toUpperCase()}
Brand: ${loan.hardware.brand}
Model: ${loan.hardware.model}
Condition: ${loan.hardware.condition}
${loan.hardware.type === 'phone' ? 'IMEI' : 'Serial Number'}: ${loan.hardware.id}

LOAN DETAILS
-------------
${isRenewed ? `Original Principal: ${formatCurrency(originalPrincipal)}\n` : ''}Principal Amount: ${formatCurrency(loan.loan.principalAmount)}
Interest Rate: ${loan.loan.interestRate}% per month
Monthly Interest: ${formatCurrency(calculateInterest())}
Maturity Date: ${formatDate(loan.loan.maturityDate)}
Status: ${loan.loan.status.toUpperCase()}${renewalInfo}${paymentsInfo}

================================
Keep this receipt for item pickup.
Present this receipt when repaying loan.
================================
    `.trim();

    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PrintReceipt = () => (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', lineHeight: '1.2', color: 'black', padding: '5px', width: '220px' }}>
      <div style={{ textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '5px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0' }}>PAWN SHOP</h1>
        <p style={{ fontSize: '9px', margin: '2px 0' }}>Pawn Ticket</p>
      </div>

      <div style={{ textAlign: 'center', border: '1px solid black', padding: '5px', marginBottom: '8px' }}>
        <p style={{ fontSize: '8px', color: '#666', margin: '0' }}>Transaction ID</p>
        <p style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace', margin: '2px 0 0 0' }}>{txnId}</p>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <p style={{ fontSize: '9px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '2px', margin: '0 0 4px 0' }}>Customer</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Name:</b> {loan.customer.name}</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Phone:</b> {loan.customer.phone}</p>
        {loan.customer.address && <p style={{ margin: '1px 0', fontSize: '8px' }}><b>Addr:</b> {loan.customer.address}</p>}
      </div>

      <div style={{ marginBottom: '6px' }}>
        <p style={{ fontSize: '9px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '2px', margin: '0 0 4px 0' }}>Device</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Type:</b> {loan.hardware.type} ({loan.hardware.condition})</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Brand:</b> {loan.hardware.brand}</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Model:</b> {loan.hardware.model}</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>{loan.hardware.type === 'phone' ? 'IMEI' : 'S/N'}:</b> {loan.hardware.id}</p>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <p style={{ fontSize: '9px', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: '2px', margin: '0 0 4px 0' }}>Loan Details</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Principal:</b> {formatCurrency(loan.loan.principalAmount)}</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Interest:</b> {loan.loan.interestRate}%/month</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Monthly Int:</b> {formatCurrency(calculateInterest())}</p>
        <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Maturity:</b> {formatDate(loan.loan.maturityDate)}</p>
        {hasRenewals && <p style={{ margin: '1px 0', fontSize: '9px' }}><b>Renewals:</b> {(loan.loan as any).renewalCount}x</p>}
      </div>

      <div style={{ textAlign: 'center', fontSize: '9px', borderTop: '1px solid #999', paddingTop: '5px' }}>
        <p style={{ margin: '1px 0' }}><b>Date:</b> {formatDate(loan.loan.createdAt)}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '9px' }}><b>Present this receipt to pickup item</b></p>
      </div>
    </div>
  );

  return (
    <>
      {/* Print-only receipt */}
      <div className="print-only">
        <PrintReceipt />
      </div>

      {/* Screen modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Pawn Receipt</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">PAWN SHOP</h1>
                <p className="text-gray-600">Pawn Ticket / Receipt</p>
                <p className="text-sm text-gray-500 mt-1">Keep this receipt for item pickup</p>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">Transaction ID</p>
                  <p className="text-3xl font-bold font-mono text-blue-900">{txnId}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{loan.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{loan.customer.phone}</span>
                    </div>
                    {loan.customer.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium text-sm">{loan.customer.email}</span>
                      </div>
                    )}
                    {loan.customer.address && (
                      <div>
                        <span className="text-gray-500 text-sm">Address:</span>
                        <p className="font-medium text-sm">{loan.customer.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Device Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">{loan.hardware.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Brand:</span>
                      <span className="font-medium">{loan.hardware.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Model:</span>
                      <span className="font-medium">{loan.hardware.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Condition:</span>
                      <span className="font-medium capitalize">{loan.hardware.condition}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">
                        {loan.hardware.type === 'phone' ? 'IMEI' : 'Serial'}:
                      </span>
                      <p className="font-medium font-mono text-sm">{loan.hardware.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2">Loan Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {isRenewed && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Original Principal:</span>
                      <span className="font-medium">{formatCurrency(originalPrincipal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Principal Amount:</span>
                    <span className="font-bold text-lg">{formatCurrency(loan.loan.principalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interest Rate:</span>
                    <span className="font-medium">{loan.loan.interestRate}% / month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Interest:</span>
                    <span className="font-medium">{formatCurrency(calculateInterest())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Maturity Date:</span>
                    <span className="font-medium">{formatDate(loan.loan.maturityDate)}</span>
                  </div>
                  {hasRenewals && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Renewal Count:</span>
                      <span className="font-medium">{(loan.loan as any).renewalCount}x</span>
                    </div>
                  )}
                </div>
              </div>

              {hasPayments && (
                <>
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 border-b pb-2 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      Payment Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Payments:</span>
                        <span className="font-bold text-green-600">{formatCurrency(totalPayments)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Remaining Balance:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(remainingBalance)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                    <h3 className="font-semibold text-gray-900 p-4 border-b bg-gray-50">Payment History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {loan.payments.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                              <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{formatDate(payment.date)}</td>
                              <td className="px-4 py-3 text-gray-900">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.type === 'renewal' ? 'bg-blue-100 text-blue-800' :
                                  payment.type === 'release' ? 'bg-gray-100 text-gray-800' :
                                  payment.type === 'principal' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {getPaymentTypeLabel(payment.type)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900 whitespace-nowrap">
                                {formatCurrency(payment.balance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              <div className="text-center text-sm text-gray-500">
                <p>Date Issued: {formatDate(loan.loan.createdAt)}</p>
                <p className="mt-2 font-medium">Present this receipt when repaying your loan</p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy for Email'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 220px;
            display: block !important;
          }
          @page {
            size: auto;
            margin: 5mm;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

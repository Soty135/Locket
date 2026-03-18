import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, LogOut } from 'lucide-react';
import { auth } from '../firebase/config';
import { getLoanById } from '../utils/loanService';
import LoanSearch from '../components/LoanSearch';
import NewLoanForm from '../components/NewLoanForm';
import LoanDetailsModal from '../components/LoanDetailsModal';
import PawnReceipt from '../components/PawnReceipt';
import LoginForm from '../components/LoginForm';
import type { Loan } from '../types/loan';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<{ id: string; data: Loan } | null>(null);
  const [receiptLoan, setReceiptLoan] = useState<{ id: string; data: Loan } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleViewDetails = (loan: { id: string; data: Loan }) => {
    setSelectedLoan(loan);
  };

  const handleCloseDetailsModal = () => {
    setSelectedLoan(null);
  };

  const handleNewLoanSuccess = async (txnId: string) => {
    setIsNewLoanOpen(false);
    setRefreshTrigger((prev) => prev + 1);
    
    const loanData = await getLoanById(txnId);
    if (loanData) {
      setReceiptLoan({ id: txnId, data: loanData });
    }
  };

  const handleCloseReceipt = () => {
    setReceiptLoan(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              <span className="text-gray-300 hidden md:inline flex-shrink-0">|</span>
              <h1 className="hidden md:inline text-xl font-semibold text-gray-900 flex-shrink-0">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsNewLoanOpen(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Loan</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoanSearch
          onViewDetails={handleViewDetails}
          refreshTrigger={refreshTrigger}
        />
      </main>

      <NewLoanForm
        isOpen={isNewLoanOpen}
        onClose={() => setIsNewLoanOpen(false)}
        onSuccess={handleNewLoanSuccess}
      />

      <LoanDetailsModal
        loan={selectedLoan}
        isOpen={!!selectedLoan}
        onClose={handleCloseDetailsModal}
      />

      {receiptLoan && (
        <PawnReceipt
          txnId={receiptLoan.id}
          loan={receiptLoan.data}
          isOpen={!!receiptLoan}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}

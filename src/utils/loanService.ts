import {
  db,
  loansCollection,
} from '../firebase/config';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { generateTxnId } from './txnIdGenerator';
import type {
  Loan,
  LoanFormData,
  LoanStatus,
  Payment,
  PaginatedLoans,
  HardwareType,
  HardwareCondition,
} from '../types/loan';

export async function getActiveLoans(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = ''
): Promise<PaginatedLoans> {
  let baseQuery = query(loansCollection, orderBy('__name__', 'desc'));
  
  if (searchTerm) {
    baseQuery = query(
      loansCollection,
      orderBy('__name__', 'desc'),
      limit(100)
    );
  } else {
    baseQuery = query(
      loansCollection,
      where('loan.status', 'in', ['active', 'overdue']),
      orderBy('loan.status'),
      orderBy('__name__', 'desc')
    );
  }
  
  const snapshot = await getDocs(baseQuery);
  
  let loans: Array<{ id: string; data: Loan }> = [];
  
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Loan;
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch =
      !searchTerm ||
      docSnap.id.toLowerCase().includes(searchLower) ||
      data.customer.name.toLowerCase().includes(searchLower) ||
      data.hardware.id.toLowerCase().includes(searchLower) ||
      (data.customer.email?.toLowerCase().includes(searchLower) ?? false);
    
    if (matchesSearch) {
      loans.push({ id: docSnap.id, data });
    }
  });
  
  if (searchTerm) {
    loans = loans.filter((loan) =>
      ['active', 'overdue'].includes(loan.data.loan.status)
    );
  }
  
  const totalCount = loans.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedLoans = loans.slice(startIndex, startIndex + pageSize);
  
  return {
    loans: paginatedLoans,
    totalCount,
    totalPages,
  };
}

export async function getLoanById(txnId: string): Promise<Loan | null> {
  const docRef = doc(db, 'loans', txnId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as Loan;
  }
  
  return null;
}

export async function checkDuplicateHardware(hardwareId: string): Promise<{ isDuplicate: boolean; existingLoanId?: string; existingCustomer?: string }> {
  const q = query(
    loansCollection,
    where('hardware.id', '==', hardwareId),
    where('loan.status', 'in', ['active', 'overdue'])
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return { isDuplicate: false };
  }
  
  const existingLoan = snapshot.docs[0];
  const loanData = existingLoan.data() as Loan;
  
  return {
    isDuplicate: true,
    existingLoanId: existingLoan.id,
    existingCustomer: loanData.customer.name,
  };
}

export async function createLoan(formData: LoanFormData): Promise<string> {
  const now = Timestamp.now();
  const maturityDate = Timestamp.fromDate(formData.maturityDate);
  const txnId = await generateTxnId();

  const newLoan: Omit<Loan, never> = {
    customer: {
      name: formData.customer.name,
      phone: formData.customer.phone,
      email: formData.customer.email || '',
      address: formData.customer.address || '',
    },
    hardware: {
      type: formData.hardware.type as HardwareType,
      id: formData.hardware.id,
      brand: formData.hardware.brand,
      model: formData.hardware.model,
      condition: formData.hardware.condition as HardwareCondition,
    },
    loan: {
      principalAmount: formData.principalAmount,
      interestRate: formData.interestRate,
      maturityDate,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      originalPrincipal: formData.principalAmount,
    },
    payments: [],
  };

  const docRef = doc(db, 'loans', txnId);
  await setDoc(docRef, newLoan);
  return txnId;
}

export async function updateLoanStatus(
  txnId: string,
  status: LoanStatus
): Promise<void> {
  const docRef = doc(db, 'loans', txnId);
  const now = Timestamp.now();
  
  await updateDoc(docRef, {
    'loan.status': status,
    'loan.updatedAt': now,
  });
}

export async function addPayment(
  txnId: string,
  payment: Omit<Payment, 'date'>
): Promise<void> {
  const docRef = doc(db, 'loans', txnId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Loan not found');
  }
  
  const loan = docSnap.data() as Loan;
  const newPayment: Payment = {
    date: Timestamp.now(),
    ...payment,
  };
  
  const updatedPayments = [...loan.payments, newPayment];
  
  await updateDoc(docRef, {
    payments: updatedPayments,
    'loan.updatedAt': Timestamp.now(),
  });
}

export async function refreshOverdueLoans(): Promise<number> {
  const now = Timestamp.now();
  const q = query(
    loansCollection,
    where('loan.status', '==', 'active')
  );
  
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  let updatedCount = 0;
  
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Loan;
    if (data.loan.maturityDate.toMillis() < now.toMillis()) {
      batch.update(docSnap.ref, {
        'loan.status': 'overdue',
        'loan.updatedAt': now,
      });
      updatedCount++;
    }
  });
  
  if (updatedCount > 0) {
    await batch.commit();
  }
  
  return updatedCount;
}

export interface RenewalResult {
  txnId: string;
  previousPrincipal: number;
  unpaidInterest: number;
  renewalFee: number;
  newPrincipal: number;
  newMaturityDate: Date;
}

export async function renewLoan(
  txnId: string,
  newMaturityDate: Date,
  renewalFee: number = 500
): Promise<RenewalResult> {
  const docRef = doc(db, 'loans', txnId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Loan not found');
  }
  
  const loan = docSnap.data() as Loan;
  
  if (loan.loan.status === 'paid') {
    throw new Error('Cannot renew a paid loan');
  }
  
  const now = Timestamp.now();
  
  const originalPrincipal = loan.loan.originalPrincipal || loan.loan.principalAmount;
  const principal = loan.loan.principalAmount;
  const interestRate = loan.loan.interestRate;
  
  const monthsSinceMaturity = calculateMonthsDifference(
    loan.loan.maturityDate.toDate(),
    now.toDate()
  );
  
  const unpaidInterest = originalPrincipal * (interestRate / 100) * Math.max(1, monthsSinceMaturity);
  
  const newPrincipal = Math.round((principal + unpaidInterest + renewalFee) * 100) / 100;
  
  const newMaturityTimestamp = Timestamp.fromDate(newMaturityDate);
  
  const renewalPayment: Payment = {
    date: now,
    amount: 0,
    type: 'renewal',
    balance: newPrincipal,
  };
  
  const updatedPayments = [...loan.payments, renewalPayment];
  
  await updateDoc(docRef, {
    'loan.principalAmount': newPrincipal,
    'loan.maturityDate': newMaturityTimestamp,
    'loan.status': 'active',
    'loan.updatedAt': now,
    'loan.renewalCount': (loan.loan as any).renewalCount ? (loan.loan as any).renewalCount + 1 : 1,
    'loan.lastRenewalFee': renewalFee,
    payments: updatedPayments,
  });
  
  return {
    txnId,
    previousPrincipal: principal,
    unpaidInterest: Math.round(unpaidInterest * 100) / 100,
    renewalFee,
    newPrincipal,
    newMaturityDate,
  };
}

function calculateMonthsDifference(startDate: Date, endDate: Date): number {
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  return Math.max(1, months + monthDiff);
}

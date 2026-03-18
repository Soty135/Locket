import { Timestamp } from 'firebase/firestore';

export type HardwareType = 'phone' | 'laptop' | 'console';
export type HardwareCondition = 'new' | 'good' | 'fair' | 'poor';
export type LoanStatus = 'active' | 'overdue' | 'paid';
export type PaymentType = 'interest' | 'principal' | 'renewal' | 'release';

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Hardware {
  type: HardwareType;
  id: string;
  brand: string;
  model: string;
  condition: HardwareCondition;
}

export interface LoanDetails {
  principalAmount: number;
  interestRate: number;
  maturityDate: Timestamp;
  status: LoanStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Payment {
  date: Timestamp;
  amount: number;
  type: PaymentType;
  balance: number;
}

export interface Loan {
  customer: Customer;
  hardware: Hardware;
  loan: LoanDetails;
  payments: Payment[];
}

export interface LoanFormData {
  customer: Omit<Customer, ''>;
  hardware: Omit<Hardware, ''>;
  principalAmount: number;
  interestRate: number;
  maturityDate: Date;
}

export interface PaginatedLoans {
  loans: Array<{ id: string; data: Loan }>;
  totalCount: number;
  totalPages: number;
}

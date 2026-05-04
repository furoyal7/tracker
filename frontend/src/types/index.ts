export type TransactionType = 'INCOME' | 'EXPENSE';
export type DebtType = 'RECEIVABLE' | 'PAYABLE';
export type DebtStatus = 'PAID' | 'UNPAID' | 'OVERDUE';

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  age?: number;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  address?: string;
  isVerified?: boolean;
  status?: 'ACTIVE' | 'SUSPENDED';
  role: 'USER' | 'ADMIN' | 'MERCHANT' | 'CUSTOMER';
  passcode?: string;
  preferredLanguage: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  date: string;
  userId: string;
  productId?: string;
  quantity?: number;
  paymentMethod?: string;
  partyName?: string;
  reference?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ExchangeStatus = 
  | 'pending' 
  | 'proof_uploaded' 
  | 'ready_for_confirmation' 
  | 'under_review' 
  | 'confirmed' 
  | 'rejected' 
  | 'completed';

export type ProofStatus = 'pending' | 'verified' | 'rejected';
export type VerificationResult = 'matched' | 'mismatch';

export interface PaymentProof {
  id: string;
  orderId: string;
  imageUrl: string;
  status: ProofStatus;
  uploadedAt: string;
}

export interface VerificationLog {
  id: string;
  orderId: string;
  checkedAmount: number;
  checkedSenderName: string;
  checkedReference: string;
  result: VerificationResult;
  createdAt: string;
}

export interface ExchangeOrder {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  exchangeRate: number;
  expectedReceiveAmount: number;
  referenceCode: string;
  senderName?: string;
  status: ExchangeStatus;
  proof?: PaymentProof;
  logs?: VerificationLog[];
  user?: { email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  type: DebtType;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  status: DebtStatus;
  dueDate: string;
  phone?: string;
  userId: string;

  payments?: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  debtId: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  totalReceivable: number;
  totalPayable: number;
  trends: {
    incomeChange: number;
    expenseChange: number;
    incomeToday: number;
    expenseToday: number;
  };
  chartData: {
    name: string;
    income: number;
    expense: number;
  }[];
  insights: {
    type: 'positive' | 'warning' | 'danger' | 'info';
    title: string;
    description: string;
  }[];
  incomeDistribution: { label: string; value: number; amount: number }[];
  expenseDistribution: { label: string; value: number; amount: number }[];
  topSellingProducts: { id: string; name: string; quantity: number; revenue: number }[];
}


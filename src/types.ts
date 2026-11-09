export type Currency = "ILS" | "USD";

export type UserSettings = {
  currency: Currency;
  trackInvestments: boolean;
};

export type Pocket = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type IncomeSource = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FixedExpense = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionType = "expense" | "income";
export type IncomeType = "ONETIME" | "SALARY";

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  date: string;
  type: TransactionType;
  description: string;
  pocketId: string;
  incomeType?: IncomeType;
  incomeSourceId?: string;
  incomeSourceText?: string;
  fixedExpenseId?: string;
  salaryMonth?: string;
  isTithed?: boolean;
  isInvestment?: boolean;
  createdAt: Date;
  updatedAt: Date;
};


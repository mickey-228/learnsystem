import { apiRequest } from './client'

export type FinanceTransaction = {
  id: number
  date: string
  type: 'income' | 'expense'
  amount: number
  category: string
  note: string | null
}

export type FinanceTransactionCreate = {
  date?: string
  type?: 'income' | 'expense'
  amount: number
  category?: string
  note?: string | null
}

export type CategoryAmount = {
  category: string
  amount: number
  pct: number
}

export type FinanceSummary = {
  month: string
  income: number
  expense: number
  balance: number
  by_category: CategoryAmount[]
}

export const financeApi = {
  listTransactions: (month: string) =>
    apiRequest<FinanceTransaction[]>(`/api/finance/transactions?month=${month}`),
  createTransaction: (payload: FinanceTransactionCreate) =>
    apiRequest<FinanceTransaction>('/api/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteTransaction: (transactionId: number) =>
    apiRequest<void>(`/api/finance/transactions/${transactionId}`, { method: 'DELETE' }),
  summary: (month: string) =>
    apiRequest<FinanceSummary>(`/api/finance/summary?month=${month}`),
}

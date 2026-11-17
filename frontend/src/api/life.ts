import { apiRequest } from './client'

export type ShoppingItemStatus = 'want' | 'bought' | 'dropped'

export type ShoppingItem = {
  id: number
  month: string
  name: string
  category: string
  quantity: number
  estimated_price: number
  actual_price: number | null
  priority: string
  status: ShoppingItemStatus
  channel: string | null
  reason: string | null
  cooling_until: string | null
  url: string | null
  note: string | null
  bought_at: string | null
}

export type ShoppingItemCreate = {
  name: string
  category?: string
  quantity?: number
  estimated_price?: number
  actual_price?: number | null
  priority?: string
  status?: ShoppingItemStatus
  channel?: string | null
  reason?: string | null
  cooling_until?: string | null
  url?: string | null
  note?: string | null
}

export type ShoppingItemUpdate = Partial<ShoppingItemCreate> & {
  bought_at?: string | null
}

export type Budget = { amount: number; note: string | null }

export type StatusCounts = { want: number; bought: number; dropped: number }

export type MonthSummary = {
  budget_amount: number | null
  spent_amount: number
  want_count: number
  want_amount: number
  bought_count: number
  remaining_amount: number | null
  usage_rate: number | null
  counts: StatusCounts
}

export type MonthView = {
  month: string
  budget: Budget | null
  items: ShoppingItem[]
  summary: MonthSummary
}

export type BudgetUpsert = { amount: number; note?: string | null }

export type Fund = {
  id: number
  name: string
  target_amount: number
  saved_amount: number
  deadline: string | null
  monthly_plan: number
  category: string
  status: 'active' | 'done' | 'paused'
  note: string | null
  progress: number
  remaining_amount: number
}

export type FundCreate = {
  name: string
  target_amount: number
  deadline?: string | null
  monthly_plan?: number
  category?: string
  note?: string | null
}

export type FundUpdate = Partial<FundCreate> & { status?: 'active' | 'done' | 'paused' }

export type FundEntry = {
  id: number
  project_id: number
  date: string
  amount: number
  note: string | null
}

export type FundEntryCreate = {
  date?: string
  amount: number
  note?: string | null
}

export const lifeApi = {
  getMonth: (month: string) => apiRequest<MonthView>(`/api/life/months/${month}`),
  upsertBudget: (month: string, payload: BudgetUpsert) =>
    apiRequest<Budget>(`/api/life/months/${month}/budget`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  createItem: (month: string, payload: ShoppingItemCreate) =>
    apiRequest<ShoppingItem>(`/api/life/months/${month}/items`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateItem: (itemId: number, payload: ShoppingItemUpdate) =>
    apiRequest<ShoppingItem>(`/api/life/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteItem: (itemId: number) =>
    apiRequest<void>(`/api/life/items/${itemId}`, { method: 'DELETE' }),

  listFunds: () => apiRequest<Fund[]>('/api/life/funds'),
  createFund: (payload: FundCreate) =>
    apiRequest<Fund>('/api/life/funds', { method: 'POST', body: JSON.stringify(payload) }),
  updateFund: (fundId: number, payload: FundUpdate) =>
    apiRequest<Fund>(`/api/life/funds/${fundId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteFund: (fundId: number) =>
    apiRequest<void>(`/api/life/funds/${fundId}`, { method: 'DELETE' }),
  addFundEntry: (fundId: number, payload: FundEntryCreate) =>
    apiRequest<FundEntry>(`/api/life/funds/${fundId}/entries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

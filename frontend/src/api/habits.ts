import { apiRequest } from './client'

export type Habit = {
  id: number
  name: string
  archived: boolean
  done_today: boolean
  streak: number
}

export type HabitCreate = { name: string }

export type HabitUpdate = {
  name?: string
  archived?: boolean
}

export const habitsApi = {
  list: (date: string) => apiRequest<Habit[]>(`/api/habits?date=${date}`),
  create: (payload: HabitCreate) =>
    apiRequest<Habit>('/api/habits', { method: 'POST', body: JSON.stringify(payload) }),
  update: (habitId: number, payload: HabitUpdate) =>
    apiRequest<Habit>(`/api/habits/${habitId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (habitId: number) =>
    apiRequest<void>(`/api/habits/${habitId}`, { method: 'DELETE' }),
  toggle: (habitId: number, date: string) =>
    apiRequest<Habit>(`/api/habits/${habitId}/toggle?date=${date}`, { method: 'POST' }),
}

import { apiRequest } from './client'

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'

export type Goal = {
  id: number
  title: string
  description: string | null
  target_value: number | null
  target_unit: string | null
  start_date: string
  target_date: string | null
  status: GoalStatus
  created_at: string
}

export type GoalCreate = {
  title: string
  description?: string | null
  target_value?: number | null
  target_unit?: string | null
  target_date?: string | null
}

export type Subject = {
  id: number
  name: string
  color: string
  goal_id: number | null
}

export type SubjectCreate = {
  name: string
  color?: string
  goal_id?: number | null
}

export type PlanItemStatus = 'pending' | 'done'

export type PlanItem = {
  id: number
  title: string
  subject_id: number | null
  subject_name: string | null
  estimated_minutes: number
  priority: number
  scheduled_start: string | null
  status: PlanItemStatus
  actual_minutes: number
  sort_order: number
  completed_at: string | null
}

export type DaySummary = {
  total_items: number
  done_items: number
  completion_rate: number
  planned_minutes: number
  actual_minutes: number
}

export type DayPlan = {
  id: number
  plan_date: string
  focus: string | null
  notes: string | null
  items: PlanItem[]
  summary: DaySummary
}

export type PlanItemCreate = {
  title: string
  subject_id?: number | null
  estimated_minutes?: number
  priority?: number
}

export type CompleteItemPayload = {
  minutes: number
  content?: string | null
  self_rating?: number | null
}

export type GoalUpdate = Partial<GoalCreate> & { status?: GoalStatus }

export type TaskItem = {
  id: number
  plan_date: string
  title: string
  estimated_minutes: number
  priority: number
  status: PlanItemStatus
  actual_minutes: number
  completed_at: string | null
}

export type TimeSession = {
  id: number
  plan_item_id: number | null
  goal_id: number | null
  task_title: string | null
  started_at: string
  ended_at: string
  minutes: number
  mode: 'focus' | 'short_break' | 'long_break'
  source: 'pomodoro' | 'manual'
  note: string | null
  created_at: string
}

export type TimeSessionCreate = {
  plan_item_id?: number | null
  goal_id?: number | null
  task_title?: string | null
  started_at: string
  ended_at: string
  minutes: number
  mode?: 'focus' | 'short_break' | 'long_break'
  source?: 'pomodoro' | 'manual'
  note?: string | null
}

export const learningApi = {
  listGoals: () => apiRequest<Goal[]>('/api/learning/goals'),
  createGoal: (payload: GoalCreate) =>
    apiRequest<Goal>('/api/learning/goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateGoal: (goalId: number, payload: GoalUpdate) =>
    apiRequest<Goal>(`/api/learning/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteGoal: (goalId: number) =>
    apiRequest<void>(`/api/learning/goals/${goalId}`, { method: 'DELETE' }),

  listSubjects: () => apiRequest<Subject[]>('/api/learning/subjects'),
  createSubject: (payload: SubjectCreate) =>
    apiRequest<Subject>('/api/learning/subjects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteSubject: (subjectId: number) =>
    apiRequest<void>(`/api/learning/subjects/${subjectId}`, { method: 'DELETE' }),

  getPlan: (planDate: string) => apiRequest<DayPlan>(`/api/learning/plans/${planDate}`),
  createPlanItem: (planDate: string, payload: PlanItemCreate) =>
    apiRequest<PlanItem>(`/api/learning/plans/${planDate}/items`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deletePlanItem: (itemId: number) =>
    apiRequest<void>(`/api/learning/plan-items/${itemId}`, { method: 'DELETE' }),
  completeItem: (itemId: number, payload: CompleteItemPayload) =>
    apiRequest<PlanItem>(`/api/learning/plan-items/${itemId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reopenItem: (itemId: number) =>
    apiRequest<PlanItem>(`/api/learning/plan-items/${itemId}/reopen`, { method: 'POST' }),

  listTasks: (fromDate: string, toDate: string) =>
    apiRequest<TaskItem[]>(`/api/learning/tasks?from_date=${fromDate}&to_date=${toDate}`),
  listTimeSessions: (date: string) =>
    apiRequest<TimeSession[]>(`/api/learning/time-sessions?date=${date}`),
  createTimeSession: (payload: TimeSessionCreate) =>
    apiRequest<TimeSession>('/api/learning/time-sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteTimeSession: (sessionId: number) =>
    apiRequest<void>(`/api/learning/time-sessions/${sessionId}`, { method: 'DELETE' }),
}

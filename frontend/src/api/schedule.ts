import { apiRequest } from './client'

export type ScheduleEvent = {
  id: number
  title: string
  date: string
  start_time: string | null
  end_time: string | null
  location: string | null
  note: string | null
  done: boolean
}

export type EventCreate = {
  title: string
  date: string
  start_time?: string | null
  end_time?: string | null
  location?: string | null
  note?: string | null
}

export type EventUpdate = Partial<EventCreate> & { done?: boolean }

export const scheduleApi = {
  list: (fromDate: string, toDate: string) =>
    apiRequest<ScheduleEvent[]>(`/api/schedule/events?from_date=${fromDate}&to_date=${toDate}`),
  create: (payload: EventCreate) =>
    apiRequest<ScheduleEvent>('/api/schedule/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (eventId: number, payload: EventUpdate) =>
    apiRequest<ScheduleEvent>(`/api/schedule/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (eventId: number) =>
    apiRequest<void>(`/api/schedule/events/${eventId}`, { method: 'DELETE' }),
}

import { describe, expect, it } from 'vitest'

import type { TaskItem } from '../api/learning'
import { groupTasks, priorityLabel } from './tasks'

function task(overrides: Partial<TaskItem>): TaskItem {
  return {
    id: 1,
    plan_date: '2026-11-10',
    title: '任务',
    estimated_minutes: 25,
    priority: 2,
    status: 'pending',
    actual_minutes: 0,
    completed_at: null,
    ...overrides,
  }
}

describe('groupTasks', () => {
  const tasks = [
    task({ id: 1, title: '今天待办', plan_date: '2026-11-10' }),
    task({
      id: 2,
      title: '今天已完成',
      plan_date: '2026-11-10',
      status: 'done',
      completed_at: '2026-11-10T09:00:00',
    }),
    task({ id: 3, title: '本周待办', plan_date: '2026-11-12' }),
    task({
      id: 4,
      title: '上周已完成',
      plan_date: '2026-11-01',
      status: 'done',
      completed_at: '2026-11-01T09:00:00',
    }),
  ]

  const groups = groupTasks(tasks, '2026-11-10')

  it('collects three groups in order', () => {
    expect(groups.map((group) => group.label)).toEqual(['今天', '本周', '已完成'])
  })

  it('puts today pending tasks into the today group', () => {
    expect(groups[0].tasks.map((task) => task.title)).toEqual(['今天待办'])
  })

  it('puts future pending tasks into the week group', () => {
    expect(groups[1].tasks.map((task) => task.title)).toEqual(['本周待办'])
  })

  it('sorts done tasks by completion time descending', () => {
    expect(groups[2].tasks.map((task) => task.title)).toEqual(['今天已完成', '上周已完成'])
  })

  it('keeps done tasks out of the pending groups', () => {
    expect(groups[0].tasks.every((task) => task.status !== 'done')).toBe(true)
    expect(groups[1].tasks.every((task) => task.status !== 'done')).toBe(true)
  })
})

describe('priorityLabel', () => {
  it('maps priority levels', () => {
    expect(priorityLabel(1)).toBe('高优先级')
    expect(priorityLabel(2)).toBe('中优先级')
    expect(priorityLabel(3)).toBe('低优先级')
  })
})

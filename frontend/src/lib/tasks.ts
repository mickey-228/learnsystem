import type { TaskItem } from '../api/learning'

export type TaskGroup = {
  key: string
  label: string
  empty: string
  tasks: TaskItem[]
}

export function priorityLabel(priority: number): string {
  if (priority === 1) return '高优先级'
  if (priority === 2) return '中优先级'
  return '低优先级'
}

export function priorityDot(priority: number): string {
  if (priority === 1) return 'bg-red-500'
  if (priority === 2) return 'bg-amber-400'
  return 'bg-slate-300'
}

export function groupTasks(tasks: TaskItem[], today: string): TaskGroup[] {
  const doneTasks = tasks
    .filter((task) => task.status === 'done')
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))

  return [
    {
      key: 'today',
      label: '今天',
      empty: '今天没有待办任务。',
      tasks: tasks.filter((task) => task.plan_date === today && task.status !== 'done'),
    },
    {
      key: 'week',
      label: '本周',
      empty: '本周还没有安排。',
      tasks: tasks.filter((task) => task.plan_date > today && task.status !== 'done'),
    },
    {
      key: 'done',
      label: '已完成',
      empty: '最近还没有完成的任务。',
      tasks: doneTasks,
    },
  ]
}

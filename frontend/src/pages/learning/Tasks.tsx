import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { errorMessage } from '../../api/client'
import { addDaysISO, todayISO } from '../../api/date'
import { learningApi } from '../../api/learning'
import { groupTasks, priorityLabel } from '../../lib/tasks'

const today = todayISO()
const fromDate = addDaysISO(today, -30)
const toDate = addDaysISO(today, 14)

export function TasksPage() {
  const tasksQuery = useQuery({
    queryKey: ['tasks', fromDate, toDate],
    queryFn: () => learningApi.listTasks(fromDate, toDate),
  })

  const groups = groupTasks(tasksQuery.data ?? [], today)

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">任务库</h1>
        </div>
        <div className="top-actions">
          <Link to="/" className="btn primary">
            去今日添加
          </Link>
        </div>
      </header>

      {tasksQuery.isError ? (
        <p className="error-text">{errorMessage(tasksQuery.error)}</p>
      ) : null}
      {tasksQuery.isLoading ? <p className="sub">加载中…</p> : null}

      <div className="grid-3">
        {groups.map((group) => (
          <section className="panel" key={group.key}>
            <div className="panel-head">
              <span className="panel-title">{group.label}</span>
              <span className="more">{group.tasks.length} 项</span>
            </div>
            <div className="task-list">
              {group.tasks.map((task) => {
                const done = task.status === 'done'
                return (
                  <div className="task-row" key={task.id}>
                    <span className={`task-check${done ? ' done' : ''}`}>✓</span>
                    <span
                      className={`priority ${
                        task.priority === 1
                          ? 'high'
                          : task.priority === 2
                            ? 'medium'
                            : 'low'
                      }`}
                    ></span>
                    <div className="task-info">
                      <p className={`task-title${done ? ' done' : ''}`}>{task.title}</p>
                      <p className="task-meta">
                        预计 {task.estimated_minutes} 分钟 · {priorityLabel(task.priority)} ·{' '}
                        {task.plan_date.slice(5)}
                        {done ? ` · 实际 ${task.actual_minutes} 分钟` : ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            {group.tasks.length === 0 ? <p className="empty">{group.empty}</p> : null}
          </section>
        ))}
      </div>
    </>
  )
}

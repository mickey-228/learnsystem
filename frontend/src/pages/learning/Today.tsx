import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { errorMessage } from '../../api/client'
import { formatChineseDate, todayISO } from '../../api/date'
import { learningApi } from '../../api/learning'
import { Pomodoro } from '../../components/Pomodoro'
import { priorityLabel } from '../../lib/tasks'

const today = todayISO()

export function TodayPage() {
  const queryClient = useQueryClient()
  const planQuery = useQuery({
    queryKey: ['plan', today],
    queryFn: () => learningApi.getPlan(today),
  })

  const [title, setTitle] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('30')
  const [priority, setPriority] = useState('2')
  const [actualMinutes, setActualMinutes] = useState<Record<number, string>>({})

  const invalidatePlan = () => {
    void queryClient.invalidateQueries({ queryKey: ['plan', today] })
  }

  const addItem = useMutation({
    mutationFn: () =>
      learningApi.createPlanItem(today, {
        title: title.trim(),
        estimated_minutes: Number(estimatedMinutes),
        priority: Number(priority),
      }),
    onSuccess: () => {
      setTitle('')
      void invalidatePlan()
    },
  })

  const completeItem = useMutation({
    mutationFn: ({ itemId, minutes }: { itemId: number; minutes: number }) =>
      learningApi.completeItem(itemId, { minutes }),
    onSuccess: () => void invalidatePlan(),
  })

  const reopenItem = useMutation({
    mutationFn: (itemId: number) => learningApi.reopenItem(itemId),
    onSuccess: () => void invalidatePlan(),
  })

  const deleteItem = useMutation({
    mutationFn: (itemId: number) => learningApi.deletePlanItem(itemId),
    onSuccess: () => void invalidatePlan(),
  })

  const plan = planQuery.data
  const summary = plan?.summary
  const mutationError =
    errorMessage(addItem.error) ??
    errorMessage(completeItem.error) ??
    errorMessage(reopenItem.error) ??
    errorMessage(deleteItem.error)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) {
      return
    }
    addItem.mutate()
  }

  const handleComplete = (itemId: number, fallbackMinutes: number) => {
    const parsed = Number(actualMinutes[itemId] ?? fallbackMinutes)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return
    }
    completeItem.mutate({ itemId, minutes: parsed })
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">{formatChineseDate(today)}</h1>
        </div>
      </header>

      <div className="grid-3">
        <article className="card tone-1">
          <div className="card-head">
            <span className="card-title">完成</span>
          </div>
          <div className="metric">
            {summary?.done_items ?? 0}
            <span className="unit">/ {summary?.total_items ?? 0}</span>
          </div>
        </article>

        <article className="card tone-2">
          <div className="card-head">
            <span className="card-title">完成率</span>
          </div>
          <div className="metric">
            {Math.round((summary?.completion_rate ?? 0) * 100)}
            <span className="unit">%</span>
          </div>
        </article>

        <article className="card tone-3">
          <div className="card-head">
            <span className="card-title">实际 / 预计</span>
          </div>
          <div className="metric">
            {summary?.actual_minutes ?? 0}
            <span className="unit">/ {summary?.planned_minutes ?? 0} 分</span>
          </div>
        </article>
      </div>

      <Pomodoro date={today} tasks={plan?.items ?? []} />

      <form className="card" onSubmit={handleSubmit}>
        <div className="card-head">
          <span className="card-title">添加任务</span>
        </div>
        <div className="add-form">
          <input
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="今天要学什么？"
          />
          <input
            className="input short"
            type="number"
            min={1}
            max={1440}
            value={estimatedMinutes}
            onChange={(event) => setEstimatedMinutes(event.target.value)}
            aria-label="预计分钟"
          />
          <select
            className="input"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            aria-label="优先级"
          >
            <option value="1">高</option>
            <option value="2">中</option>
            <option value="3">低</option>
          </select>
          <button
            type="submit"
            disabled={addItem.isPending}
            className="btn primary"
          >
            添加
          </button>
        </div>
        {mutationError ? <p className="error-text">{mutationError}</p> : null}
      </form>

      {planQuery.isError ? (
        <p className="error-text">{errorMessage(planQuery.error)}</p>
      ) : null}

      <ul className="task-list">
        {plan?.items.map((item) => {
          const minutesValue = actualMinutes[item.id] ?? String(item.estimated_minutes)
          const done = item.status === 'done'
          return (
            <li className="task-row" key={item.id}>
              <span className={`task-check${done ? ' done' : ''}`}>✓</span>
              <span
                className={`priority ${
                  item.priority === 1 ? 'high' : item.priority === 2 ? 'medium' : 'low'
                }`}
              ></span>
              <div className="task-info">
                <p className={`task-title${done ? ' done' : ''}`}>{item.title}</p>
                <p className="task-meta">
                  预计 {item.estimated_minutes} 分钟 · {priorityLabel(item.priority)}
                  {done ? ` · 实际 ${item.actual_minutes} 分钟` : ''}
                </p>
              </div>
              {done ? (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => reopenItem.mutate(item.id)}
                >
                  重开
                </button>
              ) : (
                <div className="row">
                  <input
                    className="input short"
                    type="number"
                    min={1}
                    max={1440}
                    value={minutesValue}
                    onChange={(event) =>
                      setActualMinutes((previous) => ({
                        ...previous,
                        [item.id]: event.target.value,
                      }))
                    }
                    aria-label="实际分钟"
                  />
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => handleComplete(item.id, item.estimated_minutes)}
                    disabled={completeItem.isPending}
                  >
                    完成
                  </button>
                </div>
              )}
              <button
                type="button"
                className="link-btn danger"
                onClick={() => {
                  if (window.confirm(`删除任务「${item.title}」？`)) {
                    deleteItem.mutate(item.id)
                  }
                }}
              >
                删除
              </button>
            </li>
          )
        })}
      </ul>

      {plan && plan.items.length === 0 ? (
        <p className="empty">今天还没有任务。先加一个 25 分钟的小任务开始。</p>
      ) : null}
    </>
  )
}

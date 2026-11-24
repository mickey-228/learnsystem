import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { errorMessage } from '../../api/client'
import { learningApi } from '../../api/learning'
import type { Goal } from '../../api/learning'

function statusLabel(status: Goal['status']): string {
  if (status === 'active') return '进行中'
  if (status === 'paused') return '暂停'
  if (status === 'completed') return '已完成'
  return '归档'
}

export function GoalsPage() {
  const queryClient = useQueryClient()
  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: learningApi.listGoals })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [targetUnit, setTargetUnit] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setTargetValue('')
    setTargetUnit('')
    setTargetDate('')
  }

  const saveGoal = useMutation({
    mutationFn: () => {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        target_value: targetValue === '' ? null : Number(targetValue),
        target_unit: targetUnit.trim() || null,
        target_date: targetDate || null,
      }
      return editingId === null
        ? learningApi.createGoal(payload)
        : learningApi.updateGoal(editingId, payload)
    },
    onSuccess: () => {
      resetForm()
      void queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  const deleteGoal = useMutation({
    mutationFn: (goalId: number) => learningApi.deleteGoal(goalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id)
    setTitle(goal.title)
    setDescription(goal.description ?? '')
    setTargetValue(goal.target_value === null ? '' : String(goal.target_value))
    setTargetUnit(goal.target_unit ?? '')
    setTargetDate(goal.target_date ?? '')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) {
      return
    }
    saveGoal.mutate()
  }

  const goals = goalsQuery.data ?? []

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">你想完成什么</h1>
          <p className="page-sub">
            名称由你自己填写，比如「雅思」「算法」；下面的描述写具体目标。
          </p>
        </div>
      </header>

      <form className="card" onSubmit={handleSubmit}>
        <div className="card-head">
          <span className="card-title">
            {editingId === null ? '新建目标' : '编辑目标'}
          </span>
          {editingId !== null ? (
            <button type="button" className="link-btn" onClick={resetForm}>
              取消编辑
            </button>
          ) : null}
        </div>
        <div className="add-form">
          <input
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="名称，例如：雅思 / 算法"
          />
          <input
            className="input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="描述，例如：雅思 7 分"
          />
          <input
            className="input short"
            type="number"
            min={0}
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
            placeholder="总量"
            aria-label="总量"
          />
          <input
            className="input short"
            value={targetUnit}
            onChange={(event) => setTargetUnit(event.target.value)}
            placeholder="单位"
            aria-label="单位"
          />
          <input
            className="input date"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            aria-label="截止日期"
          />
          <button
            type="submit"
            disabled={saveGoal.isPending}
            className="btn primary"
          >
            {editingId === null ? '创建' : '保存'}
          </button>
        </div>
        {errorMessage(saveGoal.error) ? (
          <p className="error-text">{errorMessage(saveGoal.error)}</p>
        ) : null}
      </form>

      {goalsQuery.isError ? (
        <p className="error-text">{errorMessage(goalsQuery.error)}</p>
      ) : null}

      <div className="grid-3">
        {goals.map((goal, index) => (
          <article className={`card tone-${(index % 6) + 1}`} key={goal.id}>
            <div className="card-head">
              <span className="card-title">{goal.title}</span>
              <span className="badge">{statusLabel(goal.status)}</span>
            </div>
            {goal.description ? <p className="goal-name">{goal.description}</p> : null}
            <p className="sub">
              {goal.target_value != null
                ? `总量 ${goal.target_value} ${goal.target_unit ?? ''}`
                : '未设置总量'}
              {goal.target_date ? ` · 截止 ${goal.target_date}` : ''}
            </p>
            <div className="row">
              <button type="button" className="link-btn" onClick={() => startEdit(goal)}>
                编辑
              </button>
              <button
                type="button"
                className="link-btn danger"
                onClick={() => {
                  if (window.confirm(`删除目标「${goal.title}」？`)) {
                    deleteGoal.mutate(goal.id)
                  }
                }}
              >
                删除
              </button>
            </div>
          </article>
        ))}
      </div>

      {goals.length === 0 ? (
        <p className="empty">
          还没有目标。先写一个名称和描述，比如「雅思」和「雅思 7 分」。
        </p>
      ) : null}
    </>
  )
}

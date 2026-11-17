import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { errorMessage } from '../../api/client'
import { learningApi } from '../../api/learning'

export function SubjectsPage() {
  const queryClient = useQueryClient()
  const subjectsQuery = useQuery({
    queryKey: ['subjects'],
    queryFn: learningApi.listSubjects,
  })
  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: learningApi.listGoals })

  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [goalId, setGoalId] = useState('')

  const createSubject = useMutation({
    mutationFn: () =>
      learningApi.createSubject({
        name: name.trim(),
        color,
        goal_id: goalId === '' ? null : Number(goalId),
      }),
    onSuccess: () => {
      setName('')
      void queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })

  const deleteSubject = useMutation({
    mutationFn: (subjectId: number) => learningApi.deleteSubject(subjectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['subjects'] })
      void queryClient.invalidateQueries({ queryKey: ['plan'] })
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      return
    }
    createSubject.mutate()
  }

  const subjects = subjectsQuery.data ?? []
  const goals = goalsQuery.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">科目</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">学习领域</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-4 ring-1 ring-slate-200"
      >
        <p className="text-sm font-medium text-slate-700">新建科目</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：算法、英语、系统设计"
            className="min-w-56 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
            aria-label="颜色"
          />
          <select
            value={goalId}
            onChange={(event) => setGoalId(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="">不关联目标</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={createSubject.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            创建
          </button>
        </div>
        {errorMessage(createSubject.error) ? (
          <p className="mt-3 text-sm text-red-600">{errorMessage(createSubject.error)}</p>
        ) : null}
      </form>

      {subjectsQuery.isError ? (
        <p className="text-sm text-red-600">{errorMessage(subjectsQuery.error)}</p>
      ) : null}

      <ul className="space-y-2">
        {subjects.map((subject) => {
          const goalName = goals.find((goal) => goal.id === subject.goal_id)?.title
          return (
            <li
              key={subject.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <div>
                  <p className="font-medium text-slate-900">{subject.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {goalName ? `关联目标：${goalName}` : '未关联目标'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`删除科目「${subject.name}」？`)) {
                    deleteSubject.mutate(subject.id)
                  }
                }}
                className="text-xs text-slate-400 hover:text-red-600"
              >
                删除
              </button>
            </li>
          )
        })}
      </ul>

      {subjects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          还没有科目。建一个科目，今天的任务就能归类统计。
        </p>
      ) : null}
    </div>
  )
}

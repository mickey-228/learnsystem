import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { errorMessage } from '../api/client'
import { learningApi } from '../api/learning'
import type { PlanItem } from '../api/learning'

type Mode = 'focus' | 'short' | 'long'

type Durations = Record<Mode, number>

type PomodoroProps = {
  date: string
  tasks: PlanItem[]
}

const DEFAULT_DURATIONS: Durations = { focus: 25, short: 5, long: 15 }

const MODE_LABELS: Record<Mode, string> = {
  focus: '专注',
  short: '短休息',
  long: '长休息',
}

function formatClock(totalSeconds: number): string {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function formatSessionTime(value: string): string {
  return new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Pomodoro({ date, tasks }: PomodoroProps) {
  const queryClient = useQueryClient()
  const [durations, setDurations] = useState<Durations>(DEFAULT_DURATIONS)
  const [mode, setMode] = useState<Mode>('focus')
  const [seconds, setSeconds] = useState(DEFAULT_DURATIONS.focus * 60)
  const [running, setRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [drafts, setDrafts] = useState({
    focus: String(DEFAULT_DURATIONS.focus),
    short: String(DEFAULT_DURATIONS.short),
    long: String(DEFAULT_DURATIONS.long),
  })
  const startedAtRef = useRef<Date | null>(null)

  const sessionsQuery = useQuery({
    queryKey: ['time-sessions', date],
    queryFn: () => learningApi.listTimeSessions(date),
  })

  const createSession = useMutation({
    mutationFn: learningApi.createTimeSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['time-sessions', date] })
    },
  })

  const deleteSession = useMutation({
    mutationFn: learningApi.deleteTimeSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['time-sessions', date] })
    },
  })

  const pendingTasks = tasks.filter((task) => task.status === 'pending')
  const effectiveTaskId =
    selectedTaskId ?? (pendingTasks[0] ? String(pendingTasks[0].id) : 'free')
  const selectedTask = tasks.find((item) => String(item.id) === effectiveTaskId)
  const taskLabel = selectedTask?.title ?? '自由学习'

  useEffect(() => {
    if (!running) {
      return
    }
    const timer = setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  useEffect(() => {
    if (seconds !== 0 || !running) {
      return
    }

    // The countdown reaching zero is an external timer event; stop it here.
    // oxlint-disable-next-line react/set-state-in-effect
    setRunning(false)
    if (mode === 'focus') {
      const endedAt = new Date()
      const startedAt =
        startedAtRef.current ?? new Date(endedAt.getTime() - durations.focus * 60 * 1000)

      createSession.mutate({
        plan_item_id: selectedTask?.id ?? null,
        task_title: taskLabel,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        minutes: durations.focus,
        mode: 'focus',
        source: 'pomodoro',
      })
      startedAtRef.current = null
    }
    setSeconds(durations[mode] * 60)
  }, [seconds, running, mode, durations, selectedTask, taskLabel, createSession])

  const totalSeconds = durations[mode] * 60
  const elapsed = ((totalSeconds - seconds) / totalSeconds) * 100
  const sessions = sessionsQuery.data ?? []
  const focusSessions = sessions.filter((session) => session.mode === 'focus')
  const totalMinutes = focusSessions.reduce((sum, session) => sum + session.minutes, 0)
  const error =
    errorMessage(createSession.error) ??
    errorMessage(deleteSession.error) ??
    errorMessage(sessionsQuery.error)

  const switchMode = (next: Mode) => {
    setMode(next)
    setSeconds(durations[next] * 60)
    setRunning(false)
    startedAtRef.current = null
  }

  const reset = () => {
    setSeconds(durations[mode] * 60)
    setRunning(false)
    startedAtRef.current = null
  }

  const toggleTimer = () => {
    if (running) {
      setRunning(false)
      return
    }
    if (seconds === durations[mode] * 60) {
      startedAtRef.current = new Date()
    } else if (!startedAtRef.current) {
      const elapsedSeconds = durations[mode] * 60 - seconds
      startedAtRef.current = new Date(Date.now() - elapsedSeconds * 1000)
    }
    setRunning(true)
  }

  const openSettings = () => {
    setDrafts({
      focus: String(durations.focus),
      short: String(durations.short),
      long: String(durations.long),
    })
    setShowSettings(true)
  }

  const saveSettings = () => {
    const clamp = (value: string, fallback: number) =>
      Math.max(1, Math.min(180, Number(value) || fallback))
    const next = {
      focus: clamp(drafts.focus, 25),
      short: clamp(drafts.short, 5),
      long: clamp(drafts.long, 15),
    }
    setDurations(next)
    setSeconds(next[mode] * 60)
    setRunning(false)
    startedAtRef.current = null
    setShowSettings(false)
  }

  return (
    <article className="card tone-4 pomodoro-card">
      <div className="card-head">
        <span className="card-title">番茄钟</span>
        <span className="badge">
          {running ? '专注中' : mode === 'focus' ? '准备专注' : '休息一下'}
        </span>
        <button type="button" className="timer-settings-btn" onClick={openSettings}>
          设置
        </button>
      </div>

      <div className="pomodoro-grid">
        <div>
          <div className="timer-modes">
            {(Object.keys(durations) as Mode[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`timer-mode${mode === key ? ' active' : ''}`}
                onClick={() => switchMode(key)}
              >
                {MODE_LABELS[key]} {durations[key]}
              </button>
            ))}
          </div>

          {showSettings ? (
            <div className="timer-settings">
              <label className="timer-field">
                专注
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={drafts.focus}
                  onChange={(event) => setDrafts({ ...drafts, focus: event.target.value })}
                />
                分
              </label>
              <label className="timer-field">
                短休
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={drafts.short}
                  onChange={(event) => setDrafts({ ...drafts, short: event.target.value })}
                />
                分
              </label>
              <label className="timer-field">
                长休
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={drafts.long}
                  onChange={(event) => setDrafts({ ...drafts, long: event.target.value })}
                />
                分
              </label>
              <button type="button" className="btn primary" onClick={saveSettings}>
                保存
              </button>
              <button type="button" className="btn" onClick={() => setShowSettings(false)}>
                取消
              </button>
            </div>
          ) : null}

          <p className="timer-display">{formatClock(seconds)}</p>

          <select
            className="input"
            value={effectiveTaskId}
            onChange={(event) => setSelectedTaskId(event.target.value)}
            aria-label="本次专注任务"
          >
            <option value="free">自由学习</option>
            {pendingTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>

          <p className="timer-sub">本次专注将记录到「{taskLabel}」</p>
          <div className="progress">
            <i style={{ width: `${Math.min(100, Math.max(0, elapsed))}%` }}></i>
          </div>
          <div className="timer-actions">
            <button type="button" className="btn primary" onClick={toggleTimer}>
              {running ? '暂停' : '开始'}
            </button>
            <button type="button" className="btn" onClick={reset}>
              重置
            </button>
          </div>
        </div>

        <div>
          <div className="panel-head">
            <span className="panel-title">今日专注</span>
            <span className="more">
              {totalMinutes} 分钟 · {focusSessions.length} 个番茄
            </span>
          </div>
          <div className="session-list">
            {focusSessions.map((session) => (
              <div className="session-row" key={session.id}>
                <span className="session-time">{formatSessionTime(session.started_at)}</span>
                <span className="session-info">{session.task_title ?? '自由学习'}</span>
                <span className="session-minutes">{session.minutes} 分</span>
                <button
                  type="button"
                  className="link-btn danger"
                  onClick={() => deleteSession.mutate(session.id)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
          {focusSessions.length === 0 ? (
            <p className="empty">今天还没有专注记录。开始一个番茄试试。</p>
          ) : null}
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
    </article>
  )
}

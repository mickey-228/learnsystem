import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { currentMonthISO, shiftMonth, todayISO } from '../../api/date'
import { errorMessage } from '../../api/client'
import { financeApi } from '../../api/finance'
import { habitsApi } from '../../api/habits'
import { lifeApi } from '../../api/life'
import type { ShoppingItem, ShoppingItemCreate } from '../../api/life'
import { scheduleApi } from '../../api/schedule'
import type { EventUpdate } from '../../api/schedule'

const today = todayISO()
const thisMonth = currentMonthISO()

type LifeTab = 'shopping' | 'funds' | 'finance' | 'habits' | 'schedule'

const TABS: { key: LifeTab; label: string }[] = [
  { key: 'shopping', label: '待买' },
  { key: 'funds', label: '资金项目' },
  { key: 'finance', label: '财务' },
  { key: 'habits', label: '习惯' },
  { key: 'schedule', label: '日程' },
]

function money(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `¥${value.toFixed(2)}`
}

function statusLabel(status: string): string {
  if (status === 'want') return '想买'
  if (status === 'bought') return '已买'
  return '放弃'
}

function statusClass(status: string): string {
  if (status === 'want') return ' status-want'
  if (status === 'bought') return ' status-bought'
  return ' status-dropped'
}

function ShoppingTab() {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState(thisMonth)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [estimatedPrice, setEstimatedPrice] = useState('')
  const [priority, setPriority] = useState('想要')

  const monthQuery = useQuery({
    queryKey: ['life-month', month],
    queryFn: () => lifeApi.getMonth(month),
  })
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['life-month', month] })
  }

  const saveBudget = useMutation({
    mutationFn: (amount: number) => lifeApi.upsertBudget(month, { amount }),
    onSuccess: invalidate,
  })
  const createItem = useMutation({
    mutationFn: (payload: ShoppingItemCreate) => lifeApi.createItem(month, payload),
    onSuccess: () => {
      invalidate()
      setEditingId(null)
      setName('')
      setCategory('')
      setEstimatedPrice('')
      setPriority('想要')
    },
  })
  const updateItem = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof lifeApi.updateItem>[1] }) =>
      lifeApi.updateItem(id, payload),
    onSuccess: () => {
      invalidate()
      setEditingId(null)
      resetForm()
    },
  })
  const deleteItemMutation = useMutation({
    mutationFn: lifeApi.deleteItem,
    onSuccess: invalidate,
  })

  function resetForm() {
    setName('')
    setCategory('')
    setEstimatedPrice('')
    setPriority('想要')
  }

  const summary = monthQuery.data?.summary
  const items = monthQuery.data?.items ?? []
  const budget = monthQuery.data?.budget ?? null
  const editing = editingId !== null ? items.find((item) => item.id === editingId) ?? null : null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || Number(estimatedPrice) < 0) return
    const payload = {
      name: name.trim(),
      category: category.trim() || '其他',
      estimated_price: Number(estimatedPrice || 0),
      priority,
    }
    if (editingId !== null && editing) {
      updateItem.mutate({ id: editingId, payload })
    } else {
      createItem.mutate({ ...payload, status: 'want' })
    }
  }

  const startEdit = (item: ShoppingItem) => {
    setEditingId(item.id)
    setName(item.name)
    setCategory(item.category)
    setEstimatedPrice(String(item.estimated_price))
    setPriority(item.priority)
  }

  const markBought = (item: ShoppingItem) => {
    const input = window.prompt(
      `「${item.name}」的实际价格`,
      String(item.estimated_price || ''),
    )
    if (input === null) return
    const price = Number(input)
    if (!Number.isFinite(price) || price < 0) return
    updateItem.mutate({ id: item.id, payload: { status: 'bought', actual_price: price } })
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">本月预算</p>
          <h1 className="month-title">
            {month.slice(0, 4)} 年 {Number(month.slice(5, 7))} 月
          </h1>
        </div>
        <div className="top-actions">
          <button type="button" className="btn ghost" onClick={() => setMonth(shiftMonth(month, -1))}>
            上个月
          </button>
          <button type="button" className="btn" onClick={() => setMonth(thisMonth)}>
            回到本月
          </button>
          <button type="button" className="btn ghost" onClick={() => setMonth(shiftMonth(month, 1))}>
            下个月
          </button>
        </div>
      </div>

      {monthQuery.isError ? (
        <p className="error-text">{errorMessage(monthQuery.error)}</p>
      ) : null}
      {monthQuery.isLoading ? <p className="sub">加载中…</p> : null}

      {summary ? (
        <div className="grid-2">
          <article className="card tone-4">
            <div className="card-head">
              <span className="card-title">预算</span>
              <span className="badge">
                {summary.usage_rate !== null ? `已用 ${Math.round(summary.usage_rate * 100)}%` : '未设置'}
              </span>
            </div>
            <div className="budget-line">
              <span className="budget-big">
                {summary.remaining_amount !== null ? money(summary.remaining_amount) : '—'}
              </span>
              <span className="sub">剩余</span>
            </div>
            <p className="sub">
              预算 {money(summary.budget_amount)} · 已花 {money(summary.spent_amount)}
            </p>
            {summary.usage_rate !== null ? (
              <div className="progress">
                <i style={{ width: `${Math.min(100, summary.usage_rate * 100)}%` }}></i>
              </div>
            ) : null}
          </article>

          <article className="card tone-2">
            <div className="card-head">
              <span className="card-title">本月概览</span>
            </div>
            <div className="grid-3" style={{ gap: 8 }}>
              <div>
                <div className="metric" style={{ fontSize: 22 }}>
                  {summary.want_count}
                  <span className="unit">件</span>
                </div>
                <p className="sub">想买</p>
              </div>
              <div>
                <div className="metric" style={{ fontSize: 22 }}>
                  {money(summary.want_amount)}
                </div>
                <p className="sub">想买预估</p>
              </div>
              <div>
                <div className="metric" style={{ fontSize: 22 }}>
                  {summary.bought_count}
                  <span className="unit">件</span>
                </div>
                <p className="sub">本月已买</p>
              </div>
            </div>
          </article>
        </div>
      ) : null}

      <BudgetEditor
        key={month}
        current={budget?.amount ?? null}
        onSave={(amount) => saveBudget.mutate(amount)}
        saving={saveBudget.isPending}
      />

      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit(event)
        }}
      >
        <div className="card-head">
          <span className="card-title">{editing ? '编辑待买' : '添加待买'}</span>
          {editing ? (
            <button type="button" className="link-btn" onClick={resetForm}>
              取消编辑
            </button>
          ) : null}
        </div>
        <div className="add-form">
          <input
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="想买什么？"
          />
          <input
            className="input short"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="分类"
          />
          <input
            className="input short"
            type="number"
            min={0}
            step="0.01"
            value={estimatedPrice}
            onChange={(event) => setEstimatedPrice(event.target.value)}
            placeholder="价格"
            aria-label="预估价格"
          />
          <select
            className="input"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            aria-label="优先级"
          >
            <option value="必需">必需</option>
            <option value="想要">想要</option>
            <option value="观望">观望</option>
          </select>
          <button type="submit" disabled={createItem.isPending || updateItem.isPending} className="btn primary">
            {editing ? '保存' : '添加'}
          </button>
        </div>
        {errorMessage(createItem.error) ?? errorMessage(updateItem.error) ? (
          <p className="error-text">
            {errorMessage(createItem.error) ?? errorMessage(updateItem.error)}
          </p>
        ) : null}
      </form>

      <ul className="task-list">
        {items.map((item) => (
          <li className="task-row" key={item.id}>
            <span className={`chip done${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
            <div className="task-info">
              <p className="task-title">{item.name}</p>
              <p className="task-meta">
                {item.category} · {item.priority} · {money(item.actual_price ?? item.estimated_price)}
                {item.reason ? ` · ${item.reason}` : ''}
              </p>
            </div>
            <div className="row">
              {item.status === 'want' ? (
                <>
                  <button type="button" className="btn primary" onClick={() => markBought(item)}>
                    已买
                  </button>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => updateItem.mutate({ id: item.id, payload: { status: 'dropped' } })}
                  >
                    放弃
                  </button>
                </>
              ) : null}
              {item.status === 'dropped' ? (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => updateItem.mutate({ id: item.id, payload: { status: 'want' } })}
                >
                  恢复
                </button>
              ) : null}
              <button type="button" className="link-btn" onClick={() => startEdit(item)}>
                编辑
              </button>
              <button
                type="button"
                className="link-btn danger"
                onClick={() => {
                  if (window.confirm(`删除「${item.name}」？`)) deleteItemMutation.mutate(item.id)
                }}
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>

      {monthQuery.data && items.length === 0 ? (
        <p className="empty">这个月还没有待买记录。先记一笔。</p>
      ) : null}
    </>
  )
}

function BudgetEditor({
  current,
  onSave,
  saving,
}: {
  current: number | null
  onSave: (amount: number) => void
  saving: boolean
}) {
  const [amount, setAmount] = useState(current === null ? '' : String(current))
  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault()
        if (amount.trim() === '') return
        onSave(Number(amount))
      }}
    >
      <div className="card-head">
        <span className="card-title">设置预算</span>
      </div>
      <div className="add-form">
        <input
          className="input"
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="1000"
          aria-label="预算金额"
        />
        <button type="submit" disabled={saving} className="btn primary">
          保存预算
        </button>
      </div>
    </form>
  )
}

function FundsTab() {
  const queryClient = useQueryClient()
  const fundsQuery = useQuery({ queryKey: ['life-funds'], queryFn: lifeApi.listFunds })
  const funds = fundsQuery.data ?? []

  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [monthly, setMonthly] = useState('')

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['life-funds'] })

  const createFund = useMutation({
    mutationFn: () =>
      lifeApi.createFund({ name: name.trim(), target_amount: Number(target || 0), monthly_plan: Number(monthly || 0) }),
    onSuccess: () => {
      invalidate()
      setName('')
      setTarget('')
      setMonthly('')
    },
  })
  const addEntry = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      lifeApi.addFundEntry(id, { amount }),
    onSuccess: invalidate,
  })
  const deleteFund = useMutation({ mutationFn: lifeApi.deleteFund, onSuccess: invalidate })

  return (
    <>
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim() || !Number(target)) return
          createFund.mutate()
        }}
      >
        <div className="card-head">
          <span className="card-title">新建资金项目</span>
        </div>
        <div className="add-form">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="项目名称，例如：去日本旅游" />
          <input className="input short" type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="目标金额" aria-label="目标金额" />
          <input className="input short" type="number" min={0} value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="每月计划" aria-label="每月计划" />
          <button type="submit" disabled={createFund.isPending} className="btn primary">
            创建
          </button>
        </div>
        {errorMessage(createFund.error) ? (
          <p className="error-text">{errorMessage(createFund.error)}</p>
        ) : null}
      </form>

      <div className="grid-2">
        {funds.map((fund) => (
          <article className="card tone-1" key={fund.id}>
            <div className="card-head">
              <span className="card-title">{fund.name}</span>
              <span className="badge">{Math.round(fund.progress * 100)}%</span>
            </div>
            <div className="budget-line">
              <span className="budget-big">{money(fund.saved_amount)}</span>
              <span className="sub">/ {money(fund.target_amount)}</span>
            </div>
            <div className="progress">
              <i style={{ width: `${Math.min(100, fund.progress * 100)}%` }}></i>
            </div>
            <p className="sub">
              剩余 {money(fund.remaining_amount)}
              {fund.deadline ? ` · 截止 ${fund.deadline}` : ''}
            </p>
            <div className="row">
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  const input = window.prompt(`给「${fund.name}」投入多少？`, String(fund.monthly_plan || ''))
                  if (input === null) return
                  const amount = Number(input)
                  if (Number.isFinite(amount) && amount > 0) addEntry.mutate({ id: fund.id, amount })
                }}
              >
                投入
              </button>
              <button
                type="button"
                className="link-btn danger"
                onClick={() => {
                  if (window.confirm(`删除资金项目「${fund.name}」？`)) deleteFund.mutate(fund.id)
                }}
              >
                删除
              </button>
            </div>
          </article>
        ))}
      </div>

      {fundsQuery.data && funds.length === 0 ? (
        <p className="empty">还没有资金项目。存钱去旅游、换电脑都可以建一个。</p>
      ) : null}
    </>
  )
}

function FinanceTab() {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState(thisMonth)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const summaryQuery = useQuery({
    queryKey: ['finance-summary', month],
    queryFn: () => financeApi.summary(month),
  })
  const transactionsQuery = useQuery({
    queryKey: ['finance-transactions', month],
    queryFn: () => financeApi.listTransactions(month),
  })
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['finance-summary', month] })
    void queryClient.invalidateQueries({ queryKey: ['finance-transactions', month] })
  }

  const createTransaction = useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: () => {
      invalidate()
      setAmount('')
      setNote('')
    },
  })
  const deleteTransaction = useMutation({
    mutationFn: financeApi.deleteTransaction,
    onSuccess: invalidate,
  })

  const summary = summaryQuery.data
  const transactions = transactionsQuery.data ?? []

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">本月财务</p>
          <h1 className="month-title">
            {month.slice(0, 4)} 年 {Number(month.slice(5, 7))} 月
          </h1>
        </div>
        <div className="top-actions">
          <button type="button" className="btn ghost" onClick={() => setMonth(shiftMonth(month, -1))}>
            上个月
          </button>
          <button type="button" className="btn" onClick={() => setMonth(thisMonth)}>
            回到本月
          </button>
          <button type="button" className="btn ghost" onClick={() => setMonth(shiftMonth(month, 1))}>
            下个月
          </button>
        </div>
      </div>

      {summary ? (
        <div className="grid-3">
          <article className="card tone-2">
            <div className="card-head"><span className="card-title">收入</span></div>
            <div className="metric">{money(summary.income)}</div>
          </article>
          <article className="card tone-6">
            <div className="card-head"><span className="card-title">支出</span></div>
            <div className="metric">{money(summary.expense)}</div>
          </article>
          <article className="card tone-4">
            <div className="card-head"><span className="card-title">结余</span></div>
            <div className="metric">{money(summary.balance)}</div>
          </article>
        </div>
      ) : null}

      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          if (!Number(amount)) return
          createTransaction.mutate({ type, amount: Number(amount), category: category.trim() || '其他', note: note.trim() || null })
        }}
      >
        <div className="card-head"><span className="card-title">记一笔</span></div>
        <div className="add-form">
          <select className="input" value={type} onChange={(e) => setType(e.target.value as 'income' | 'expense')} aria-label="类型">
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
          <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="分类，例如：餐饮" />
          <input className="input short" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="金额" aria-label="金额" />
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注（可选）" />
          <button type="submit" disabled={createTransaction.isPending} className="btn primary">
            添加
          </button>
        </div>
        {errorMessage(createTransaction.error) ? (
          <p className="error-text">{errorMessage(createTransaction.error)}</p>
        ) : null}
      </form>

      {summary && summary.by_category.length > 0 ? (
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">分类支出</span>
            <span className="more">共 {money(summary.expense)}</span>
          </div>
          <div className="stack">
            {summary.by_category.map((item) => (
              <div className="row" key={item.category}>
                <span className="sub" style={{ width: 64, flex: '0 0 64px' }}>{item.category}</span>
                <div className="progress">
                  <i style={{ width: `${Math.min(100, item.pct * 100)}%` }}></i>
                </div>
                <span className="muted mono">{money(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">最近交易</span>
          <span className="more">{transactions.length} 笔</span>
        </div>
        <div className="stack">
          {transactions.map((transaction) => (
            <div className="row" key={transaction.id}>
              <span className={`chip${transaction.type === 'income' ? ' done' : ''}`}>
                {transaction.type === 'income' ? '收入' : '支出'}
              </span>
              <div className="task-info">
                <p className="task-title">{transaction.category}</p>
                <p className="task-meta">
                  {transaction.date.slice(5)}
                  {transaction.note ? ` · ${transaction.note}` : ''}
                </p>
              </div>
              <span className="right mono">
                {transaction.type === 'income' ? '+' : ''}
                {money(transaction.amount)}
              </span>
              <button
                type="button"
                className="link-btn danger"
                onClick={() => deleteTransaction.mutate(transaction.id)}
              >
                删除
              </button>
            </div>
          ))}
        </div>
        {transactions.length === 0 ? <p className="empty">本月还没有交易记录。</p> : null}
      </div>
    </>
  )
}

function HabitsTab() {
  const queryClient = useQueryClient()
  const habitsQuery = useQuery({ queryKey: ['habits', today], queryFn: () => habitsApi.list(today) })
  const habits = habitsQuery.data ?? []

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['habits', today] })
  const [name, setName] = useState('')
  const createHabit = useMutation({
    mutationFn: () => habitsApi.create({ name: name.trim() }),
    onSuccess: () => {
      invalidate()
      setName('')
    },
  })
  const toggleHabit = useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) => habitsApi.toggle(id, date),
    onSuccess: invalidate,
  })
  const deleteHabit = useMutation({ mutationFn: habitsApi.remove, onSuccess: invalidate })

  return (
    <>
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) return
          createHabit.mutate()
        }}
      >
        <div className="card-head"><span className="card-title">新建习惯</span></div>
        <div className="add-form">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="习惯名称，例如：早起" />
          <button type="submit" disabled={createHabit.isPending} className="btn primary">
            创建
          </button>
        </div>
        {errorMessage(createHabit.error) ? (
          <p className="error-text">{errorMessage(createHabit.error)}</p>
        ) : null}
      </form>

      <ul className="task-list">
        {habits.map((habit) => (
          <li className="task-row" key={habit.id}>
            <button
              type="button"
              className={`task-check${habit.done_today ? ' done' : ''}`}
              onClick={() => toggleHabit.mutate({ id: habit.id, date: today })}
            >
              ✓
            </button>
            <div className="task-info">
              <p className="task-title">{habit.name}</p>
              <p className="task-meta">连续 {habit.streak} 天</p>
            </div>
            <button
              type="button"
              className="link-btn danger"
              onClick={() => {
                if (window.confirm(`删除习惯「${habit.name}」？`)) deleteHabit.mutate(habit.id)
              }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {habitsQuery.data && habits.length === 0 ? (
        <p className="empty">还没有习惯。建一个每天都能完成的小习惯开始。</p>
      ) : null}
    </>
  )
}

function ScheduleTab() {
  const queryClient = useQueryClient()
  const fromDate = today
  const toDate = today

  const eventsQuery = useQuery({
    queryKey: ['schedule', fromDate, toDate],
    queryFn: () => scheduleApi.list(fromDate, toDate),
  })
  const events = eventsQuery.data ?? []

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState('')
  const [location, setLocation] = useState('')

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['schedule', fromDate, toDate] })
  }
  const createEvent = useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => {
      invalidate()
      setTitle('')
      setStartTime('')
      setLocation('')
    },
  })
  const updateEvent = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EventUpdate }) =>
      scheduleApi.update(id, payload),
    onSuccess: invalidate,
  })
  const deleteEvent = useMutation({ mutationFn: scheduleApi.remove, onSuccess: invalidate })

  return (
    <>
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault()
          if (!title.trim()) return
          createEvent.mutate({
            title: title.trim(),
            date,
            start_time: startTime || null,
            location: location.trim() || null,
          })
        }}
      >
        <div className="card-head"><span className="card-title">添加日程</span></div>
        <div className="add-form">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="日程标题" />
          <input className="input date" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="日期" />
          <input className="input short" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="15:00" aria-label="开始时间" />
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="地点（可选）" />
          <button type="submit" disabled={createEvent.isPending} className="btn primary">
            添加
          </button>
        </div>
        {errorMessage(createEvent.error) ? (
          <p className="error-text">{errorMessage(createEvent.error)}</p>
        ) : null}
      </form>

      <ul className="task-list">
        {events.map((event) => (
          <li className="task-row" key={event.id}>
            <button
              type="button"
              className={`task-check${event.done ? ' done' : ''}`}
              onClick={() => updateEvent.mutate({ id: event.id, payload: { done: !event.done } })}
            >
              ✓
            </button>
            <div className="task-info">
              <p className={`task-title${event.done ? ' done' : ''}`}>{event.title}</p>
              <p className="task-meta">
                {event.date.slice(5)}
                {event.start_time ? ` · ${event.start_time}` : ''}
                {event.location ? ` · ${event.location}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="link-btn danger"
              onClick={() => {
                if (window.confirm(`删除日程「${event.title}」？`)) deleteEvent.mutate(event.id)
              }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {eventsQuery.data && events.length === 0 ? (
        <p className="empty">今天没有日程安排。</p>
      ) : null}
    </>
  )
}

export function LifePage() {
  const [tab, setTab] = useState<LifeTab>('shopping')

  return (
    <>
      <header className="page-head">
        <div>
          <p className="eyebrow">生活</p>
          <h1 className="page-title">生活</h1>
          <p className="page-sub">待买、资金项目、财务、习惯、日程</p>
        </div>
      </header>

      <div className="tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`tab${tab === item.key ? ' active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'shopping' ? <ShoppingTab /> : null}
      {tab === 'funds' ? <FundsTab /> : null}
      {tab === 'finance' ? <FinanceTab /> : null}
      {tab === 'habits' ? <HabitsTab /> : null}
      {tab === 'schedule' ? <ScheduleTab /> : null}
    </>
  )
}

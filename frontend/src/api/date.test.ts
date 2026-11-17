import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  addDaysISO,
  defaultDateForMonth,
  formatChineseDate,
  monthEndISO,
  shiftMonth,
  todayISO,
} from './date'

describe('addDaysISO', () => {
  it('adds days within a month', () => {
    expect(addDaysISO('2026-11-10', 3)).toBe('2026-11-13')
  })

  it('crosses month and year boundaries', () => {
    expect(addDaysISO('2026-12-30', 5)).toBe('2027-01-04')
  })

  it('subtracts days', () => {
    expect(addDaysISO('2026-11-10', -10)).toBe('2026-10-31')
  })
})

describe('shiftMonth', () => {
  it('moves back across the year', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })

  it('moves forward across the year', () => {
    expect(shiftMonth('2026-11', 2)).toBe('2027-01')
  })
})

describe('monthEndISO', () => {
  it('handles non-leap February', () => {
    expect(monthEndISO('2026-02')).toBe('2026-02-28')
  })

  it('handles leap February', () => {
    expect(monthEndISO('2024-02')).toBe('2024-02-29')
  })

  it('handles 30-day months', () => {
    expect(monthEndISO('2026-11')).toBe('2026-11-30')
  })
})

describe('formatChineseDate', () => {
  it('formats without leading zeros', () => {
    expect(formatChineseDate('2026-11-10')).toBe('2026 年 11 月 10 日')
  })
})

describe('today helpers with a fixed clock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-10T08:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('todayISO returns the local date', () => {
    expect(todayISO()).toBe('2026-11-10')
  })

  it('defaultDateForMonth returns today inside the current month', () => {
    expect(defaultDateForMonth('2026-11')).toBe('2026-11-10')
  })

  it('defaultDateForMonth returns the first day for other months', () => {
    expect(defaultDateForMonth('2026-10')).toBe('2026-10-01')
  })
})

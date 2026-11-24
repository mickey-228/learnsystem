import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const iconPaths: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5ZM4 20.5A2.5 2.5 0 0 1 6.5 18H20',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  note: 'M5 3h10l4 4v14H5V3ZM9 13h6M9 17h5',
  bag: 'M6 8h12l-1 12H7L6 8ZM9 8V6a3 3 0 0 1 6 0v2',
  moon: 'M20 15.5A8.5 8.5 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4',
  sparkle: 'M12 3l1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z',
}

function NavIcon({ name, size = 15 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}

const navItems = [
  { to: '/', label: '今日', icon: 'grid', end: true },
  { to: '/goals', label: '目标', icon: 'book' },
  { to: '/tasks', label: '任务', icon: 'list' },
  { to: '/notes', label: '笔记', icon: 'note' },
  { to: '/life', label: '生活', icon: 'bag' },
]

const weekHeads = ['一', '二', '三', '四', '五', '六', '日']

function buildMonthGrid() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const start = (new Date(year, month, 1).getDay() + 6) % 7
  const total = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let index = 0; index < 35; index += 1) {
    const day = index - start + 1
    cells.push(day >= 1 && day <= total ? day : null)
  }
  return { cells, today, label: `${year} 年 ${month + 1} 月` }
}

const monthGrid = buildMonthGrid()

export function Layout() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('c0-theme') === 'dark' ? 'dark' : 'light',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('c0-theme', theme)
  }, [theme])

  return (
    <div className="c0-shell">
      <aside className="c0-sidebar">
        <div className="c0-brand">
          <span className="c0-brand-mark">
            <NavIcon name="sparkle" size={17} />
          </span>
          <div className="c0-brand-name">小生活</div>
        </div>

        <div className="c0-cal" role="group" aria-label={monthGrid.label}>
          {weekHeads.map((head) => (
            <span key={head} className="c0-cal-head" aria-hidden="true">
              {head}
            </span>
          ))}
          {monthGrid.cells.map((day, index) => (
            <span
              key={index}
              className={`c0-cal-day${day === monthGrid.today ? ' today' : ''}`}
            >
              {day ?? ''}
            </span>
          ))}
        </div>

        <nav className="c0-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `c0-nav-item${isActive ? ' active' : ''}`}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="c0-sidebar-foot">
          <button
            type="button"
            className="c0-theme-toggle"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            <span className="c0-theme-label">
              <NavIcon name={theme === 'dark' ? 'sun' : 'moon'} size={12} />
              {theme === 'dark' ? '浅色模式' : '深色模式'}
            </span>
            <span className="c0-switch"></span>
          </button>
        </div>
      </aside>

      <main className="c0-main">
        <div className="c0-page">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const { useState } = React;

/* ── 图标 ───────────────────────────────────────────── */
const iconPaths = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.6" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </>
  ),
  bag: (
    <>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  heart: <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v5h-5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12l4 4L19 6" />,
  flame: <path d="M12 22c4 0 7-2.7 7-6.5 0-3-1.8-5.2-3.6-7.1C13.8 6.5 12 4.5 12 2c0 3.5-2.4 5.2-4 7.2C6.4 11.1 5 13 5 15.5 5 19.3 8 22 12 22Z" />,
  leaf: (
    <>
      <path d="M20 4C12 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z" />
      <path d="M4 21c3-6 7-9 12-11" />
    </>
  ),
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 9h18" />
      <circle cx="16.5" cy="13.5" r="1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  sparkle: <path d="M12 3l1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  trend: (
    <>
      <path d="M4 17l5-5 4 3 7-8" />
      <path d="M15 7h5v5" />
    </>
  ),
  run: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  pill: (
    <>
      <rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(-45 12 12)" />
      <path d="M9 15l6-6" />
    </>
  ),
  note: (
    <>
      <path d="M5 3h10l4 4v14H5V3Z" />
      <path d="M14 3v5h5M8 13h8M8 17h5" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 19h16" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11-4-4L4 16v4Z" />
      <path d="M13 5l4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
};

function Icon({ name, size = 18, strokeWidth = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name] || iconPaths.sparkle}
    </svg>
  );
}

/* ── 导航与数据 ─────────────────────────────────────── */
const NAV = [
  { key: "overview", label: "总览", icon: "grid" },
  { key: "learning", label: "学习", icon: "book" },
  { key: "life", label: "生活", icon: "bag" },
  { key: "health", label: "健康", icon: "heart" },
  { key: "review", label: "复盘", icon: "refresh" },
];

const SUB_NAV = [
  { key: "shopping", label: "待买" },
  { key: "funds", label: "资金项目" },
  { key: "finance", label: "财务" },
  { key: "habits", label: "习惯" },
  { key: "schedule", label: "日程" },
];

const LIFE_TABS = [
  { key: "shopping", label: "待买", icon: "bag" },
  { key: "funds", label: "资金项目", icon: "wallet" },
  { key: "finance", label: "财务", icon: "wallet" },
  { key: "habits", label: "习惯", icon: "check" },
  { key: "schedule", label: "日程", icon: "calendar" },
];

const OVERVIEW_TIMELINE = [
  { time: "07:30", title: "早起打卡", detail: "今日第 1 项", tone: "habit" },
  { time: "08:00", title: "学习打卡", detail: "两数之和 · 45 分钟", tone: "study" },
  { time: "12:30", title: "待买已买", detail: "牛奶 · ¥25", tone: "shop" },
  { time: "18:30", title: "运动", detail: "跑步 · 30 分钟", tone: "health" },
  { time: "20:30", title: "待买加入", detail: "机械键盘", tone: "shop" },
  { time: "22:30", title: "健康记录", detail: "睡眠 7.2h · 心情 4", tone: "sleep" },
];

const OVERVIEW_QUICK = [
  { icon: "book", label: "学习任务" },
  { icon: "bag", label: "加待买" },
  { icon: "heart", label: "健康记录" },
  { icon: "wallet", label: "记一笔支出" },
  { icon: "check", label: "打卡习惯" },
  { icon: "calendar", label: "加日程" },
];

const LEARNING_GOALS = [
  { shortName: "算法", name: "刷完 500 道算法题", done: 3, total: 5, rate: 60, target: "500 题", progress: 62, remaining: "190 题", date: "2027-03-31", tone: 1 },
  { shortName: "雅思", name: "雅思 7 分", done: 1, total: 2, rate: 50, target: "7 分", progress: 42, remaining: "提升 1 分", date: "2027-01-15", tone: 2 },
  { shortName: "系统设计", name: "系统设计入门", done: 2, total: 3, rate: 67, target: "12 章", progress: 35, remaining: "7 章", date: "2027-02-28", tone: 3 },
  { shortName: "阅读", name: "读完《设计数据密集型应用》", done: 4, total: 8, rate: 50, target: "8 个里程碑", progress: 50, remaining: "4 个里程碑", date: "2027-04-30", tone: 4, nonQuant: true },
];

const LEARNING_TASKS = [
  { title: "两数之和 + 滑动窗口复习", subject: "算法", minutes: 45, priority: "high", done: true },
  { title: "读 DDIA 第 4 章", subject: "阅读", minutes: 30, priority: "medium", done: true },
  { title: "英语精读一篇", subject: "英语", minutes: 20, priority: "medium", done: true },
  { title: "系统设计：短链服务", subject: "系统设计", minutes: 40, priority: "high", done: false },
  { title: "复盘今天的错题", subject: "算法", minutes: 15, priority: "low", done: false },
];

const TASK_LIBRARY = [
  { title: "系统设计：短链服务", goal: "系统设计入门", minutes: 40, priority: "high", status: "todo", due: "今天" },
  { title: "复盘今天的错题", goal: "刷完 500 道算法题", minutes: 15, priority: "low", status: "todo", due: "今天" },
  { title: "读 DDIA 第 5 章", goal: "读完 DDIA", minutes: 30, priority: "medium", status: "todo", due: "明天" },
  { title: "英语听力 20 分钟", goal: "英语阅读 20 篇", minutes: 20, priority: "low", status: "todo", due: "周三" },
  { title: "系统设计：限流器", goal: "系统设计入门", minutes: 40, priority: "high", status: "todo", due: "周五" },
  { title: "两数之和 + 滑动窗口复习", goal: "刷完 500 道算法题", minutes: 45, priority: "high", status: "done", due: "今天" },
  { title: "读 DDIA 第 4 章", goal: "读完 DDIA", minutes: 30, priority: "medium", status: "done", due: "今天" },
  { title: "英语精读一篇", goal: "英语阅读 20 篇", minutes: 20, priority: "medium", status: "done", due: "今天" },
];

const POMODORO_SESSIONS = [
  { time: "09:00", task: "两数之和", minutes: 25, tone: 1 },
  { time: "10:00", task: "读 DDIA 第 4 章", minutes: 25, tone: 2 },
  { time: "14:00", task: "两数之和", minutes: 45, tone: 1 },
];

const OBSIDIAN_NOTES = [
  { title: "算法 · 滑动窗口", tags: ["算法", "复习"], updated: "今天 09:40", path: "学习/算法/滑动窗口.md", tone: 1 },
  { title: "系统设计 · 短链服务", tags: ["系统设计"], updated: "昨天 21:10", path: "学习/系统设计/短链服务.md", tone: 2 },
  { title: "DDIA 第 4 章笔记", tags: ["阅读", "DDIA"], updated: "11-07", path: "阅读/DDIA/ch04.md", tone: 3 },
  { title: "英语精读 · The Economist", tags: ["英语"], updated: "11-06", path: "英语/精读/1106.md", tone: 4 },
];

const SHOPPING_ITEMS = [
  { name: "机械键盘", category: "数码", price: 399, status: "want", reason: "写代码更舒服", cooling: "冷静期至 11-15", tone: 3 },
  { name: "跑鞋", category: "运动", price: 299, status: "want", reason: "旧鞋磨平了", cooling: "冷静期至 11-20", tone: 1 },
  { name: "台灯", category: "家居", price: 159, status: "want", reason: "晚上看书不刺眼", cooling: "", tone: 5 },
  { name: "书立", category: "日用品", price: 39, status: "want", reason: "桌面收纳", cooling: "", tone: 2 },
  { name: "牛奶", category: "食品", price: 25, status: "bought", reason: "日常", cooling: "", tone: 2 },
  { name: "收纳盒", category: "日用品", price: 45, status: "bought", reason: "整理桌面", cooling: "", tone: 5 },
  { name: "游戏机", category: "数码", price: 2999, status: "dropped", reason: "想想还是算了", cooling: "", tone: 6 },
];

const FUNDS = [
  { name: "去日本旅游", target: 20000, saved: 8000, deadline: "2027-06-01", monthly: 1500, tone: 1, icon: "leaf" },
  { name: "换电脑", target: 12000, saved: 3000, deadline: "2027-03-01", monthly: 1000, tone: 2, icon: "wallet" },
  { name: "应急金", target: 30000, saved: 12000, deadline: "2027-12-31", monthly: 1200, tone: 3, icon: "heart" },
];

const FUND_ENTRIES = [
  { name: "去日本旅游", amount: 1000, date: "11-01", tone: 1 },
  { name: "换电脑", amount: 500, date: "11-03", tone: 2 },
  { name: "应急金", amount: 800, date: "11-05", tone: 3 },
];

const TRANSACTIONS = [
  { name: "午饭 · 食堂", category: "餐饮", amount: -28, date: "11-09", tone: 1 },
  { name: "地铁", category: "交通", amount: -6, date: "11-09", tone: 5 },
  { name: "牛奶 + 收纳盒", category: "生活", amount: -70, date: "11-08", tone: 2 },
  { name: "课程订阅", category: "学习", amount: -199, date: "11-07", tone: 4 },
  { name: "兼职收入", category: "收入", amount: 4000, date: "11-05", tone: 2, income: true },
];

const FINANCE_CATEGORIES = [
  { name: "餐饮", amount: 600, pct: 35, color: "var(--accent)" },
  { name: "学习", amount: 400, pct: 24, color: "var(--butter)" },
  { name: "生活", amount: 300, pct: 18, color: "var(--sage)" },
  { name: "交通", amount: 200, pct: 12, color: "var(--sky)" },
  { name: "其他", amount: 200, pct: 11, color: "var(--lilac)" },
];

const HABITS = [
  { name: "早起", done: true, streak: 12, tone: 4 },
  { name: "阅读", done: true, streak: 8, tone: 2 },
  { name: "运动", done: true, streak: 5, tone: 1 },
  { name: "喝水 2L", done: false, streak: 3, tone: 5 },
  { name: "冥想 10 分钟", done: false, streak: 0, tone: 3 },
];

const HABIT_HEAT = [
  1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
  1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
  1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
];

const WEEK = [
  { dow: "一", day: 3 }, { dow: "二", day: 4 }, { dow: "三", day: 5 },
  { dow: "四", day: 6 }, { dow: "五", day: 7 }, { dow: "六", day: 8 },
  { dow: "日", day: 9, today: true },
];

const EVENTS = [
  { time: "15:00", title: "组会", meta: "线上 · 腾讯会议", tone: "var(--accent)" },
  { time: "20:00", title: "健身", meta: "力量训练 · 45 分钟", tone: "var(--sage)" },
  { time: "明天 10:00", title: "交课程作业", meta: "系统设计 · 截止", tone: "var(--butter)" },
  { time: "周五 19:00", title: "看电影", meta: "和朋友 · 万达", tone: "var(--lilac)" },
];

const HEALTH_STATS = [
  { label: "睡眠", value: "7.2", unit: "h", sub: "昨晚 23:30 - 06:42", icon: "moon", tone: 3 },
  { label: "运动", value: "30", unit: "min", sub: "跑步 · 中等强度", icon: "run", tone: 2 },
  { label: "饮水", value: "1,800", unit: "ml", sub: "目标 2,000ml", icon: "drop", tone: 5 },
  { label: "体重", value: "62.5", unit: "kg", sub: "较 30 天前 -0.8kg", icon: "trend", tone: 4 },
  { label: "心情", value: "4", unit: "/5", sub: "今天还不错", icon: "heart", tone: 1 },
  { label: "精力", value: "3", unit: "/5", sub: "下午有点困", icon: "sparkle", tone: 6 },
];

const QUICK_TYPES = [
  { label: "睡眠", icon: "moon" }, { label: "运动", icon: "run" },
  { label: "饮水", icon: "drop" }, { label: "体重", icon: "trend" },
  { label: "心情", icon: "heart" }, { label: "精力", icon: "sparkle" },
  { label: "生理期", icon: "calendar" }, { label: "用药", icon: "pill" },
  { label: "症状", icon: "note" },
];

const HEALTH_RECORDS = [
  { time: "07:30", title: "睡眠", detail: "7.2h · 质量 4/5", tone: "var(--lilac)" },
  { time: "08:00", title: "饮水", detail: "300ml", tone: "var(--sky)" },
  { time: "12:30", title: "饮水", detail: "500ml", tone: "var(--sky)" },
  { time: "18:30", title: "运动", detail: "跑步 30 分钟", tone: "var(--sage)" },
  { time: "22:30", title: "心情", detail: "4/5 · 精力 3/5", tone: "var(--accent)" },
];

const HEALTH_GOALS = [
  { name: "睡眠 ≥ 7 小时", value: "5 / 7 天", pct: 71, tone: 3 },
  { name: "每周运动 ≥ 150 分钟", value: "90 / 150 分钟", pct: 60, tone: 2 },
  { name: "饮水 ≥ 2,000ml", value: "4 / 7 天", pct: 57, tone: 5 },
];

const SLEEP_TREND = [6.4, 7.0, 6.8, 7.6, 7.2, 7.8, 7.2];
const EXERCISE_TREND = [0, 30, 20, 0, 45, 30, 30];
const WATER_TREND = [1600, 1800, 2000, 1500, 2200, 1900, 1800];

const REVIEW_STATS = [
  { label: "学习", value: "6.5", unit: "h", sub: "完成 18 / 24 项", tone: 1, icon: "book" },
  { label: "待买", value: "¥328", sub: "预算 ¥1,000 · 剩余 ¥672", tone: 2, icon: "bag" },
  { label: "健康", value: "7.1", unit: "h", sub: "平均睡眠 · 运动 125 分钟", tone: 3, icon: "heart" },
  { label: "财务", value: "+¥2,300", sub: "收入 4,000 · 支出 1,700", tone: 4, icon: "wallet" },
  { label: "习惯", value: "80", unit: "%", sub: "完成 16 / 20 次", tone: 5, icon: "check" },
  { label: "日程", value: "4", unit: "/6", sub: "本周完成 4 项", tone: 6, icon: "calendar" },
];

const REVIEW_HEAT = [
  [2, 2, 1, 2, 2, 1, 2],
  [1, 2, 2, 2, 2, 2, 1],
  [2, 1, 2, 1, 2, 1, 2],
  [2, 2, 1, 2, 1, 2, 2],
  [1, 2, 2, 2, 2, 1, 2],
  [2, 1, 2, 1, 1, 2, 1],
];

/* ── 通用组件 ───────────────────────────────────────── */
function money(value) {
  return `¥${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
}

function Progress({ value, color }) {
  return (
    <div className="progress">
      <i style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color || undefined }}></i>
    </div>
  );
}

function Stat({ tone = 1, icon, label, value, unit, sub, badge }) {
  return (
    <article className={`card tone-${tone}`}>
      <div className="card-head">
        <span className="icon-box"><Icon name={icon} size={15} /></span>
        <span className="card-title">{label}</span>
        {badge ? <span className="badge">{badge}</span> : null}
      </div>
      <div className="metric">{value}{unit ? <span className="unit">{unit}</span> : null}</div>
      {sub ? <p className="sub">{sub}</p> : null}
    </article>
  );
}

function Sparkline({ data, color, max }) {
  const w = 220, h = 44, pad = 4;
  const maxV = max || Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(data.length - 1, 1);
    const y = h - pad - (v / maxV) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`} fill={color} opacity="0.14" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 侧栏与顶栏 ─────────────────────────────────────── */
function Sidebar({ page, lifeTab, navigate, goLife, theme, toggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><Icon name="sparkle" size={18} /></span>
        <div>
          <div className="brand-name">小生活</div>
          <div className="brand-sub">Life Board</div>
        </div>
      </div>
      <nav className="nav">
        {NAV.map((item) => (
          <React.Fragment key={item.key}>
            <button
              type="button"
              className={`nav-item ${page === item.key ? "active" : ""}`}
              onClick={() => { if (item.key === "life") goLife("shopping"); else navigate(item.key); }}
            >
              <Icon name={item.icon} size={15} />
              <span>{item.label}</span>
              {item.key === "life" ? <span className="chev">⌄</span> : null}
            </button>
            {item.key === "life" ? (
              <div className="nav-sub">
                {SUB_NAV.map((sub) => (
                  <button
                    key={sub.key}
                    type="button"
                    className={page === "life" && lifeTab === sub.key ? "active" : ""}
                    onClick={() => goLife(sub.key)}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="streak"><Icon name="flame" size={13} /> 连续记录 12 天</div>
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          <span className="label">
            <Icon name={theme === "dark" ? "sun" : "moon"} size={12} />
            {theme === "dark" ? "浅色模式" : "深色模式"}
          </span>
          <span className="switch"></span>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ eyebrow, title, sub, action }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        {sub ? <p className="page-sub">{sub}</p> : null}
      </div>
      <div className="top-actions">
        <button type="button" className="btn"><Icon name="search" size={13} /> 搜索</button>
        {action || <button type="button" className="btn primary"><Icon name="plus" size={13} /> 快速记录</button>}
      </div>
    </header>
  );
}

/* ── 总览 ───────────────────────────────────────────── */
function OverviewPage({ navigate, goLife }) {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">2026 年 11 月 9 日 · 星期日</p>
          <div className="greeting-line">
            <h1 className="page-title">下午好，今天也慢慢来。</h1>
            <span className="greeting-spark"><Icon name="sun" size={14} /></span>
          </div>
        </div>
        <div className="top-actions">
          <button type="button" className="btn"><Icon name="search" size={13} /> 搜索</button>
          <button type="button" className="btn primary"><Icon name="plus" size={13} /> 快速记录</button>
        </div>
      </header>

      <div className="completeness">
        <span>今日完整度</span>
        <div className="dots">
          {[1, 1, 1, 1, 1, 0].map((on, i) => <span key={i} className={`dot ${on ? "on" : ""}`}></span>)}
        </div>
        <span className="count">5 / 6</span>
      </div>

      <section className="grid-3">
        <article className="card tone-1" style={{ cursor: "pointer" }} onClick={() => navigate("learning")}>
          <div className="card-head">
            <span className="icon-box"><Icon name="book" size={14} /></span>
            <span className="card-title">学习</span>
            <span className="badge">进行中</span>
          </div>
          <div className="metric">3<span className="unit">/ 5</span></div>
          <p className="sub">今日 95 分钟 · 本周 6.5 小时</p>
          <Progress value={60} />
        </article>

        <article className="card tone-2" style={{ cursor: "pointer" }} onClick={() => goLife("shopping")}>
          <div className="card-head">
            <span className="icon-box"><Icon name="bag" size={14} /></span>
            <span className="card-title">待买</span>
            <span className="badge">剩余</span>
          </div>
          <div className="metric">¥672<span className="unit">剩余</span></div>
          <p className="sub">预算 ¥1,000 · 已花 ¥328</p>
          <Progress value={32.8} />
        </article>

        <article className="card tone-3" style={{ cursor: "pointer" }} onClick={() => navigate("health")}>
          <div className="card-head">
            <span className="icon-box"><Icon name="heart" size={14} /></span>
            <span className="card-title">健康</span>
            <span className="badge">不错</span>
          </div>
          <div className="metric">7.2<span className="unit">h</span></div>
          <p className="sub">睡眠 · 运动 30 分钟 · 饮水 1,800ml</p>
          <div className="metric-row">
            <span className="pill"><Icon name="drop" size={10} /> 1,800ml</span>
            <span className="pill"><Icon name="heart" size={10} /> 心情 4/5</span>
          </div>
        </article>

        <article className="card tone-4" style={{ cursor: "pointer" }} onClick={() => goLife("finance")}>
          <div className="card-head">
            <span className="icon-box"><Icon name="wallet" size={14} /></span>
            <span className="card-title">财务</span>
            <span className="badge">本月</span>
          </div>
          <div className="metric">+¥2,300</div>
          <p className="sub">收入 ¥4,000 · 支出 ¥1,700</p>
          <div className="mini-bars">
            {[38, 64, 48, 82, 58].map((h, i) => <i key={i} style={{ height: `${h}%` }}></i>)}
          </div>
        </article>

        <article className="card tone-5" style={{ cursor: "pointer" }} onClick={() => goLife("habits")}>
          <div className="card-head">
            <span className="icon-box"><Icon name="check" size={14} /></span>
            <span className="card-title">习惯</span>
            <span className="badge">连续 12 天</span>
          </div>
          <div className="metric">3<span className="unit">/ 4</span></div>
          <p className="sub">早起 · 阅读 · 运动已完成</p>
          <div className="chips">
            <span className="chip done">早起</span>
            <span className="chip done">阅读</span>
            <span className="chip done">运动</span>
            <span className="chip">喝水</span>
          </div>
        </article>

        <article className="card tone-6" style={{ cursor: "pointer" }} onClick={() => goLife("schedule")}>
          <div className="card-head">
            <span className="icon-box"><Icon name="calendar" size={14} /></span>
            <span className="card-title">日程</span>
            <span className="badge">今天</span>
          </div>
          <div className="metric">2<span className="unit">项</span></div>
          <p className="sub">今天还有 2 项安排</p>
          <div className="schedule-list">
            <div className="schedule-line"><span className="time">15:00</span> 组会</div>
            <div className="schedule-line"><span className="time">20:00</span> 健身</div>
          </div>
        </article>
      </section>

      <section className="overview-bottom">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">今日时间线</span>
            <span className="more">全部记录 →</span>
          </div>
          <div className="timeline-list">
            {OVERVIEW_TIMELINE.map((item) => (
              <div className="timeline-item" key={item.time + item.title}>
                <span className="timeline-time">{item.time}</span>
                <span className={`timeline-dot ${item.tone}`}></span>
                <div className="timeline-text">{item.title} <span>· {item.detail}</span></div>
              </div>
            ))}
          </div>
          <div className="week-rhythm">
            <div className="week-rhythm-head"><span>本周节奏</span><span>5 天有记录</span></div>
            <div className="week-bars">
              {[44, 68, 55, 82, 74, 36, 22].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }}></i>
              ))}
            </div>
            <div className="week-days"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">快速记录</span>
            <span className="more">今天</span>
          </div>
          <div className="quick-status">
            <div className="quick-status-head"><span>今日已记录</span><span>5 / 6</span></div>
            <div className="chips">
              <span className="chip done">学习</span>
              <span className="chip done">待买</span>
              <span className="chip done">健康</span>
              <span className="chip done">财务</span>
              <span className="chip done">习惯</span>
              <span className="chip">日程</span>
            </div>
            <p className="quick-status-note">再补一条日程，今天就完整了。</p>
          </div>
          <div className="quick-grid">
            {OVERVIEW_QUICK.map((item) => (
              <button type="button" className="quick-btn" key={item.label}>
                <Icon name={item.icon} size={12} /> {item.label}
              </button>
            ))}
          </div>
          <div className="week-streak">
            <span>连续记录</span>
            <span className="streak-days">
              {[1, 1, 1, 1, 1, 0, 0].map((on, i) => <i key={i} className={on ? "on" : ""}></i>)}
            </span>
            <span>5 天</span>
          </div>
          <p className="quick-note">记录不用完美，留下一点痕迹就好。</p>
        </div>
      </section>
    </>
  );
}

/* ── 学习 ───────────────────────────────────────────── */
function PomodoroCard() {
  const [durations, setDurations] = useState({ focus: 25, short: 5, long: 15 });
  const [mode, setMode] = useState("focus");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(POMODORO_SESSIONS);
  const [showSettings, setShowSettings] = useState(false);
  const [drafts, setDrafts] = useState({ focus: "25", short: "5", long: "15" });

  const labels = {
    focus: `专注 ${durations.focus}`,
    short: `短休息 ${durations.short}`,
    long: `长休息 ${durations.long}`,
  };

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  React.useEffect(() => {
    if (seconds !== 0 || !running) return;
    setRunning(false);
    if (mode === "focus") {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setSessions((previous) => [{ time, task: "系统设计：短链服务", minutes: durations.focus, tone: 1 }, ...previous]);
    }
  }, [seconds, running, mode, durations.focus]);

  const switchMode = (next) => {
    setMode(next);
    setSeconds(durations[next] * 60);
    setRunning(false);
  };
  const reset = () => {
    setSeconds(durations[mode] * 60);
    setRunning(false);
  };
  const openSettings = () => {
    setDrafts({
      focus: String(durations.focus),
      short: String(durations.short),
      long: String(durations.long),
    });
    setShowSettings(true);
  };
  const saveSettings = () => {
    const clamp = (value, fallback) => Math.max(1, Math.min(180, Number(value) || fallback));
    const next = {
      focus: clamp(drafts.focus, 25),
      short: clamp(drafts.short, 5),
      long: clamp(drafts.long, 15),
    };
    setDurations(next);
    setSeconds(next[mode] * 60);
    setRunning(false);
    setShowSettings(false);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const total = durations[mode] * 60;
  const elapsed = ((total - seconds) / total) * 100;
  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0);

  return (
    <article className="card tone-4 pomodoro-card">
      <div className="card-head">
        <span className="icon-box"><Icon name="clock" size={15} /></span>
        <span className="card-title">番茄钟</span>
        <span className="badge">{running ? "专注中" : mode === "focus" ? "准备专注" : "休息一下"}</span>
        <button type="button" className="timer-settings-btn" onClick={openSettings}>设置</button>
      </div>

      <div className="pomodoro-grid">
        <div>
          <div className="timer-modes">
            {Object.keys(durations).map((key) => (
              <button
                key={key}
                type="button"
                className={`timer-mode ${mode === key ? "active" : ""}`}
                onClick={() => switchMode(key)}
              >
                {labels[key]}
              </button>
            ))}
          </div>

          {showSettings ? (
            <div className="timer-settings">
              <label className="timer-field">
                专注
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={drafts.focus}
                  onChange={(event) => setDrafts({ ...drafts, focus: event.target.value })}
                />
                分
              </label>
              <label className="timer-field">
                短休
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={drafts.short}
                  onChange={(event) => setDrafts({ ...drafts, short: event.target.value })}
                />
                分
              </label>
              <label className="timer-field">
                长休
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={drafts.long}
                  onChange={(event) => setDrafts({ ...drafts, long: event.target.value })}
                />
                分
              </label>
              <button type="button" className="btn primary" onClick={saveSettings}>保存</button>
              <button type="button" className="btn" onClick={() => setShowSettings(false)}>取消</button>
            </div>
          ) : null}

          <div className="timer-display">{mm}:{ss}</div>
          <p className="timer-sub">本次专注将记录到「系统设计：短链服务」</p>
          <Progress value={elapsed} />
          <div className="timer-actions">
            <button type="button" className="btn primary" onClick={() => setRunning((value) => !value)}>
              {running ? "暂停" : "开始"}
            </button>
            <button type="button" className="btn" onClick={reset}>重置</button>
          </div>
        </div>

        <div>
          <div className="panel-head">
            <span className="panel-title">今日专注</span>
            <span className="more">+ 手动补记</span>
          </div>
          <div className="session-list">
            {sessions.map((session, index) => (
              <div className="session-row" key={`${session.time}-${index}`}>
                <span className="session-time">{session.time}</span>
                <span className="record-dot" style={{ background: "var(--accent)" }}></span>
                <span className="session-info">{session.task}</span>
                <span className="session-minutes">{session.minutes} 分钟</span>
              </div>
            ))}
          </div>
          <div className="session-total">
            <span className="big">{totalMinutes}</span>
            <span className="sub">分钟 · 今日已完成 {sessions.length} 个番茄</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function LearningPlan({ goals }) {
  return (
    <>
      <div className="grid-4">
        <Stat tone={1} icon="check" label="今日完成率" value="60" unit="%" sub="3 / 5 项任务" />
        <Stat tone={2} icon="clock" label="今日学习" value="95" unit="分钟" sub="本周 6.5 小时" />
        <Stat tone={3} icon="flame" label="连续打卡" value="12" unit="天" sub="最长 21 天" />
        <Stat tone={4} icon="trend" label="本周节奏" value="6.5" unit="小时" sub="比上周 +1.2h" />
      </div>

      <PomodoroCard />

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">今日各目标完成率</span>
            <span className="more">按目标</span>
          </div>
          <div className="goal-list">
            {goals.map((goal, index) => {
              const rate = goal.total ? Math.round((goal.done / goal.total) * 100) : 0;
              return (
                <div className="goal-row" key={`${goal.shortName}-${index}`}>
                  <div className="goal-info">
                    <div className="goal-name">{goal.shortName}</div>
                    <div className="goal-meta">{goal.done} / {goal.total} 项今日任务</div>
                    <Progress value={rate} />
                  </div>
                  <div className="goal-rate">
                    <div className="num">{rate}%</div>
                    <div className="label">今日完成</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">今日任务</span>
            <span className="more">3 / 5 完成</span>
          </div>
          <div className="task-list">
            {LEARNING_TASKS.map((task) => (
              <div className="task-row" key={task.title}>
                <span className={`task-check ${task.done ? "done" : ""}`}><Icon name="check" size={12} /></span>
                <span className={`priority ${task.priority}`}></span>
                <div className="task-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className={`task-title ${task.done ? "done" : ""}`}>{task.title}</div>
                  <div className="task-meta">预计 {task.minutes} 分钟 · {task.priority === "high" ? "高优先级" : task.priority === "medium" ? "中优先级" : "低优先级"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">本周学习曲线</span><span className="more">6.5 小时</span></div>
        <div className="week-bars" style={{ height: 64 }}>
          {[42, 64, 38, 78, 55, 70, 28].map((h, i) => <i key={i} style={{ height: `${h}%` }}></i>)}
        </div>
        <div className="week-days"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>
      </div>
    </>
  );
}

function LearningGoals({ goals, setGoals }) {
  const emptyForm = { shortName: "", name: "", target: "", date: "2027-12-31" };
  const [form, setForm] = useState(emptyForm);
  const [editingIndex, setEditingIndex] = useState(null);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingIndex(null);
  };

  const startEdit = (goal, index) => {
    setForm({
      shortName: goal.shortName,
      name: goal.name,
      target: goal.target,
      date: goal.date,
    });
    setEditingIndex(index);
    document.querySelector(".add-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const saveGoal = () => {
    const shortName = form.shortName.trim();
    if (!shortName) return;
    const name = form.name.trim() || shortName;
    const target = form.target.trim() || "未设置";
    const date = form.date || "2027-12-31";

    if (editingIndex === null) {
      setGoals((previous) => [
        ...previous,
        {
          shortName,
          name,
          done: 0,
          total: 1,
          target,
          progress: 0,
          remaining: target === "未设置" ? "未设置" : target,
          date,
          tone: (previous.length % 6) + 1,
        },
      ]);
    } else {
      setGoals((previous) => previous.map((goal, index) => (
        index === editingIndex
          ? { ...goal, shortName, name, target, date }
          : goal
      )));
    }
    resetForm();
  };

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">{editingIndex === null ? "新建目标" : "编辑目标"}</span>
          <span className="more">名称由你自己填写</span>
        </div>
        <div className="add-form">
          <input
            className="input"
            style={{ flex: "1 1 140px" }}
            placeholder="名称，例如：雅思 / 算法"
            value={form.shortName}
            onChange={(event) => setForm({ ...form, shortName: event.target.value })}
          />
          <input
            className="input"
            style={{ flex: "1 1 180px" }}
            placeholder="描述，例如：雅思 7 分"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            className="input short"
            placeholder="目标值"
            value={form.target}
            onChange={(event) => setForm({ ...form, target: event.target.value })}
          />
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
          />
          <button type="button" className="btn primary" onClick={saveGoal}>
            {editingIndex === null ? "添加目标" : "保存"}
          </button>
          {editingIndex !== null ? (
            <button type="button" className="btn" onClick={resetForm}>取消</button>
          ) : null}
        </div>
      </div>

      <div className="grid-3">
        {goals.map((goal, index) => (
          <article className={`card tone-${goal.tone}`} key={`${goal.shortName}-${index}`}>
            <div className="card-head">
              <span className="icon-box"><Icon name="book" size={14} /></span>
              <span className="card-title">{goal.shortName}</span>
              <span className="badge">{goal.nonQuant ? "里程碑" : "进行中"}</span>
              <button type="button" className="icon-btn" onClick={() => startEdit(goal, index)}>编辑</button>
            </div>
            <div className="metric" style={{ fontSize: 22 }}>{goal.progress}<span className="unit">%</span></div>
            <p className="sub" style={{ fontWeight: 700, color: "var(--ink)" }}>{goal.name}</p>
            <Progress value={goal.progress} />
            <p className="sub">目标 {goal.target} · 剩余 {goal.remaining}</p>
            <p className="sub">截止 {goal.date}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function LearningTaskLibrary() {
  const groups = [
    { key: "today", label: "今天", items: TASK_LIBRARY.filter((task) => task.due === "今天" && task.status !== "done") },
    { key: "week", label: "本周", items: TASK_LIBRARY.filter((task) => task.due !== "今天" && task.status !== "done") },
    { key: "done", label: "已完成", items: TASK_LIBRARY.filter((task) => task.status === "done") },
  ];

  return (
    <div className="grid-3">
      {groups.map((group) => (
        <div className="panel" key={group.key}>
          <div className="panel-head">
            <span className="panel-title">{group.label}</span>
            <span className="more">{group.items.length} 项</span>
          </div>
          <div className="task-list">
            {group.items.map((task) => (
              <div className="task-row" key={task.title}>
                <span className={`task-check ${task.status === "done" ? "done" : ""}`}><Icon name="check" size={12} /></span>
                <span className={`priority ${task.priority}`}></span>
                <div className="task-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className={`task-title ${task.status === "done" ? "done" : ""}`}>{task.title}</div>
                  <div className="task-meta">预计 {task.minutes} 分钟 · {task.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LearningNotes() {
  return (
    <div className="grid-2">
      <div className="panel">
        <div className="panel-head"><span className="panel-title">Obsidian 连接</span><span className="more">已连接</span></div>
        <div className="obsidian-status">
          <span className="status-dot"></span>
          <div>
            <div className="obsidian-name">LifeVault</div>
            <div className="obsidian-meta">D:\Obsidian\LifeVault · 128 篇笔记</div>
          </div>
        </div>
        <p className="sub">最近同步：2 分钟前。学习笔记会按目标和标签自动归类。</p>
        <div className="row wrap">
          <button type="button" className="btn primary"><Icon name="refresh" size={13} /> 同步笔记</button>
          <a className="btn" href="obsidian://open?vault=LifeVault" target="_blank" rel="noreferrer">打开 Obsidian</a>
        </div>
        <hr className="divider" />
        <p className="sub">同步方式：后端扫描本地 vault 文件夹（推荐），或通过 Obsidian Local REST API 插件。浏览器不能直接读本地文件。</p>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">最近笔记</span><span className="more">按更新时间</span></div>
        <div className="note-list">
          {OBSIDIAN_NOTES.map((note) => (
            <div className={`note-row tone-${note.tone}`} key={note.title}>
              <div className="note-info">
                <div className="note-title">{note.title}</div>
                <div className="note-meta">{note.path} · {note.updated}</div>
                <div className="note-tags">
                  {note.tags.map((tag) => <span className="note-tag" key={tag}>{tag}</span>)}
                </div>
              </div>
              <a
                className="note-open"
                href={`obsidian://open?vault=LifeVault&file=${encodeURI(note.path)}`}
                target="_blank"
                rel="noreferrer"
              >
                打开
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LearningPage({ tab, setTab, goals, setGoals }) {
  const labels = { plan: "添加任务", goals: "新建目标", tasks: "新建任务", notes: "同步笔记" };
  return (
    <>
      <Topbar
        eyebrow="学习"
        title="学习"
        sub="今天 3/5 完成 · 95 分钟 · 连续 12 天"
        action={<button type="button" className="btn primary"><Icon name="plus" size={13} /> {labels[tab]}</button>}
      />
      <div className="tabs">
        <button type="button" className={`tab ${tab === "plan" ? "active" : ""}`} onClick={() => setTab("plan")}>今日计划</button>
        <button type="button" className={`tab ${tab === "goals" ? "active" : ""}`} onClick={() => setTab("goals")}>目标</button>
        <button type="button" className={`tab ${tab === "tasks" ? "active" : ""}`} onClick={() => setTab("tasks")}>任务</button>
        <button type="button" className={`tab ${tab === "notes" ? "active" : ""}`} onClick={() => setTab("notes")}>笔记</button>
      </div>
      {tab === "plan" ? <LearningPlan goals={goals} /> : null}
      {tab === "goals" ? <LearningGoals goals={goals} setGoals={setGoals} /> : null}
      {tab === "tasks" ? <LearningTaskLibrary /> : null}
      {tab === "notes" ? <LearningNotes /> : null}
    </>
  );
}

/* ── 生活 ───────────────────────────────────────────── */
function ShoppingTab() {
  return (
    <>
      <div className="month-bar">
        <div>
          <p className="eyebrow">本月预算</p>
          <div className="month-title">2026 年 11 月</div>
        </div>
        <div className="row">
          <button type="button" className="btn ghost">上个月</button>
          <button type="button" className="btn">回到本月</button>
          <button type="button" className="btn ghost">下个月</button>
        </div>
      </div>

      <div className="grid-2">
        <article className="card tone-4">
          <div className="card-head">
            <span className="icon-box"><Icon name="wallet" size={15} /></span>
            <span className="card-title">预算</span>
            <span className="badge">已用 32.8%</span>
          </div>
          <div className="budget-line">
            <span className="big">¥672</span>
            <span className="sub">剩余</span>
          </div>
          <p className="sub">预算 ¥1,000 · 已花 ¥328</p>
          <Progress value={32.8} />
          <div className="summary-row">
            <span className="summary-pill">食品 ¥200</span>
            <span className="summary-pill">数码 ¥500</span>
            <span className="summary-pill">其他 ¥300</span>
          </div>
        </article>

        <article className="card tone-2">
          <div className="card-head">
            <span className="icon-box"><Icon name="bag" size={15} /></span>
            <span className="card-title">本月概览</span>
          </div>
          <div className="grid-3" style={{ gap: 8 }}>
            <div><div className="metric" style={{ fontSize: 22 }}>4<span className="unit">件</span></div><p className="sub">想买</p></div>
            <div><div className="metric" style={{ fontSize: 22 }}>¥896</div><p className="sub">想买预估</p></div>
            <div><div className="metric" style={{ fontSize: 22 }}>2<span className="unit">件</span></div><p className="sub">本月已买</p></div>
          </div>
          <p className="sub">冷静期里还有 2 件，先别急。</p>
        </article>
      </div>

      <div className="panel">
        <div className="add-form">
          <input className="input name" placeholder="想买什么？" />
          <select className="input"><option>分类：其他</option><option>食品</option><option>数码</option><option>日用品</option></select>
          <input className="input short" placeholder="数量" defaultValue="1" />
          <input className="input short" placeholder="价格" />
          <select className="input"><option>优先级：想要</option><option>必需</option><option>观望</option></select>
          <button type="button" className="btn primary"><Icon name="plus" size={13} /> 添加</button>
        </div>
      </div>

      <div className="item-list">
        {SHOPPING_ITEMS.map((item) => (
          <div className={`item-row tone-${item.tone}`} key={item.name}>
            <span className={`status ${item.status}`}>
              {item.status === "want" ? "想买" : item.status === "bought" ? "已买" : "放弃"}
            </span>
            <div className="item-main">
              <div className="item-name">{item.name}</div>
              <div className="item-meta">
                {item.category} · {item.reason}{item.cooling ? ` · ${item.cooling}` : ""}
              </div>
            </div>
            <span className="item-price">{money(item.price)}</span>
            <button type="button" className="icon-btn">编辑</button>
            <button type="button" className="icon-btn">删除</button>
          </div>
        ))}
      </div>
    </>
  );
}

function FundsTab() {
  return (
    <>
      <div className="grid-3">
        {FUNDS.map((fund) => {
          const pct = Math.round((fund.saved / fund.target) * 100);
          return (
            <article className={`card tone-${fund.tone}`} key={fund.name}>
              <div className="fund-head">
                <div>
                  <div className="fund-name">{fund.name}</div>
                  <div className="fund-target">目标 {money(fund.target)}</div>
                </div>
                <span className="badge">{pct}%</span>
              </div>
              <div className="fund-numbers">
                <span className="saved">{money(fund.saved)}</span>
                <span className="target">/ {money(fund.target)}</span>
              </div>
              <Progress value={pct} />
              <div className="fund-meta">
                <span>剩余 {money(fund.target - fund.saved)}</span>
                <span>截止 {fund.deadline}</span>
              </div>
              <p className="sub">每月建议投入 {money(fund.monthly)}</p>
            </article>
          );
        })}
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">最近投入</span><span className="more">全部记录 →</span></div>
        <div className="transaction-list">
          {FUND_ENTRIES.map((entry) => (
            <div className="transaction-row" key={entry.name + entry.date}>
              <div className={`transaction-icon tone-${entry.tone}`}><Icon name="wallet" size={12} /></div>
              <div className="transaction-info">
                <div className="transaction-name">{entry.name}</div>
                <div className="transaction-date">{entry.date}</div>
              </div>
              <div className="transaction-amount income">+{money(entry.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function FinanceTab() {
  return (
    <>
      <div className="grid-3">
        <Stat tone={2} icon="wallet" label="本月收入" value="¥4,000" sub="兼职 + 生活费" />
        <Stat tone={6} icon="bag" label="本月支出" value="¥1,700" sub="比上月 -¥200" />
        <Stat tone={4} icon="trend" label="本月结余" value="+¥2,300" sub="结余率 57.5%" />
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span className="panel-title">分类支出</span><span className="more">共 ¥1,700</span></div>
          <div className="category-list">
            {FINANCE_CATEGORIES.map((cat) => (
              <div className="category-row" key={cat.name}>
                <span className="category-name">{cat.name}</span>
                <div className="category-bar"><i style={{ width: `${cat.pct}%`, background: cat.color }}></i></div>
                <span className="category-amount">{money(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="panel-title">最近交易</span><span className="more">全部 →</span></div>
          <div className="transaction-list">
            {TRANSACTIONS.map((tx) => (
              <div className="transaction-row" key={tx.name}>
                <div className={`transaction-icon tone-${tx.tone}`}><Icon name={tx.income ? "wallet" : "bag"} size={12} /></div>
                <div className="transaction-info">
                  <div className="transaction-name">{tx.name}</div>
                  <div className="transaction-date">{tx.category} · {tx.date}</div>
                </div>
                <div className={`transaction-amount ${tx.income ? "income" : ""}`}>
                  {tx.income ? "+" : ""}{money(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function HabitsTab() {
  return (
    <div className="grid-2">
      <div className="panel">
        <div className="panel-head"><span className="panel-title">今日习惯</span><span className="more">3 / 5 已完成</span></div>
        <div className="habit-list">
          {HABITS.map((habit) => (
            <div className="habit-row" key={habit.name}>
              <span className={`habit-check ${habit.done ? "done" : ""}`}><Icon name="check" size={12} /></span>
              <span className="habit-name">{habit.name}</span>
              <span className="habit-meta">连续 {habit.streak} 天</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">连续记录</span><span className="more">12 天</span></div>
        <div className="row" style={{ alignItems: "flex-end" }}>
          <div className="metric">12<span className="unit">天</span></div>
          <div style={{ marginLeft: 12 }}>
            <p className="sub">最长连续 21 天</p>
            <p className="sub">本周完成率 80%</p>
          </div>
        </div>
        <div className="heatmap">
          {HABIT_HEAT.map((v, i) => (
            <span key={i} className={`heat-cell ${v ? "on" : ""} ${v === 2 ? "strong" : ""}`}></span>
          ))}
        </div>
        <div className="row" style={{ justifyContent: "space-between", fontSize: 9, color: "var(--muted)" }}>
          <span>4 周前</span><span>本周</span>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab() {
  return (
    <>
      <div className="panel">
        <div className="panel-head"><span className="panel-title">本周</span><span className="more">11 月 9 日 - 11 月 15 日</span></div>
        <div className="week-strip">
          {WEEK.map((d) => (
            <div className={`day-chip ${d.today ? "today" : ""}`} key={d.dow}>
              <div className="dow">{d.dow}</div>
              <div className="day">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">今天与接下来</span><span className="more">4 项</span></div>
        <div className="event-list">
          {EVENTS.map((event) => (
            <div className="event-row" key={event.title}>
              <span className="event-dot" style={{ background: event.tone }}></span>
              <span className="event-time">{event.time}</span>
              <div className="event-info">
                <div className="event-title">{event.title}</div>
                <div className="event-meta">{event.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function LifePage({ tab, setTab }) {
  const labels = { shopping: "添加待买", funds: "新建项目", finance: "记一笔", habits: "新建习惯", schedule: "加日程" };
  return (
    <>
      <Topbar
        eyebrow="生活"
        title="生活"
        sub="待买、资金、财务、习惯、日程"
        action={<button type="button" className="btn primary"><Icon name="plus" size={13} /> {labels[tab]}</button>}
      />
      <div className="tabs">
        {LIFE_TABS.map((item) => (
          <button key={item.key} type="button" className={`tab ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key)}>
            <Icon name={item.icon} size={12} /> {item.label}
          </button>
        ))}
      </div>
      {tab === "shopping" ? <ShoppingTab /> : null}
      {tab === "funds" ? <FundsTab /> : null}
      {tab === "finance" ? <FinanceTab /> : null}
      {tab === "habits" ? <HabitsTab /> : null}
      {tab === "schedule" ? <ScheduleTab /> : null}
    </>
  );
}

/* ── 健康 ───────────────────────────────────────────── */
function HealthPage() {
  return (
    <>
      <Topbar
        eyebrow="健康"
        title="健康"
        sub="睡眠、运动、饮水、体重、心情、生理期"
        action={<button type="button" className="btn primary"><Icon name="plus" size={13} /> 记录今天</button>}
      />

      <div className="grid-6">
        {HEALTH_STATS.map((s) => (
          <Stat key={s.label} tone={s.tone} icon={s.icon} label={s.label} value={s.value} unit={s.unit} sub={s.sub} />
        ))}
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">快速记录</span><span className="more">今天</span></div>
        <div className="quick-types">
          {QUICK_TYPES.map((t) => (
            <button type="button" className="quick-type" key={t.label}>
              <Icon name={t.icon} size={12} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span className="panel-title">今日记录</span><span className="more">5 条</span></div>
          <div className="record-list">
            {HEALTH_RECORDS.map((r) => (
              <div className="record-row" key={r.time + r.title}>
                <span className="record-time">{r.time}</span>
                <span className="record-dot" style={{ background: r.tone }}></span>
                <div className="record-info">{r.title} <span>· {r.detail}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="panel-title">7 日趋势</span><span className="more">11-03 至 11-09</span></div>
          <div className="trend-list">
            <div className="trend-row"><span className="trend-label">睡眠</span><Sparkline data={SLEEP_TREND} color="var(--lilac)" max={9} /><span className="trend-value">7.2h</span></div>
            <div className="trend-row"><span className="trend-label">运动</span><Sparkline data={EXERCISE_TREND} color="var(--sage)" max={60} /><span className="trend-value">30m</span></div>
            <div className="trend-row"><span className="trend-label">饮水</span><Sparkline data={WATER_TREND} color="var(--sky)" max={2500} /><span className="trend-value">1.8L</span></div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span className="panel-title">健康目标</span><span className="more">自定义</span></div>
          <div className="goal-list">
            {HEALTH_GOALS.map((goal) => (
              <div className="goal-row" key={goal.name}>
                <div className="goal-info">
                  <div className="goal-name">{goal.name}</div>
                  <div className="goal-meta">{goal.value}</div>
                  <Progress value={goal.pct} />
                </div>
                <div className="goal-rate">
                  <div className="num">{goal.pct}%</div>
                  <div className="label">本周</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="panel-title">生理期</span><span className="more">周期 28 天</span></div>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 10, color: "var(--muted)" }}>
            <span>上次 10-22</span><span>预计下次 11-19</span>
          </div>
          <div className="cycle-strip">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className={`cycle-day ${i >= 3 && i <= 8 ? "period" : ""} ${i >= 24 && i <= 27 ? "predicted" : ""}`}></span>
            ))}
          </div>
          <p className="sub">本次记录：10-22 至 10-27 · 流量中等 · 轻微腹痛。</p>
          <div className="privacy-note"><Icon name="heart" size={11} /> 健康数据只保存在本地，可随时导出。</div>
        </div>
      </div>
    </>
  );
}

/* ── 复盘 ───────────────────────────────────────────── */
function ReviewPage() {
  return (
    <>
      <Topbar
        eyebrow="复盘"
        title="本周复盘"
        sub="11 月 3 日 - 11 月 9 日"
        action={
          <div className="row">
            <button type="button" className="btn"><Icon name="download" size={13} /> Markdown</button>
            <button type="button" className="btn"><Icon name="download" size={13} /> CSV</button>
          </div>
        }
      />

      <div className="grid-3">
        {REVIEW_STATS.map((s) => (
          <Stat key={s.label} tone={s.tone} icon={s.icon} label={s.label} value={s.value} unit={s.unit} sub={s.sub} />
        ))}
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">每日记录完整度</span><span className="more">5.2 / 6 平均</span></div>
        <div className="stack">
          {["学习", "待买", "健康", "财务", "习惯", "日程"].map((label, row) => (
            <div className="row" key={label}>
              <span style={{ width: 36, flex: "0 0 36px", fontSize: 9, color: "var(--muted)" }}>{label}</span>
              <div className="heatmap-6" style={{ flex: 1 }}>
                {REVIEW_HEAT[row].map((v, i) => <span key={i} className={`heat-cell-6 l${v}`}></span>)}
              </div>
            </div>
          ))}
          <div className="row">
            <span style={{ width: 36, flex: "0 0 36px" }}></span>
            <div className="heat-labels" style={{ flex: 1 }}>
              <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
            </div>
          </div>
        </div>
      </div>

      <div className="review-text">
        <div className="review-box"><strong>本周做得好</strong>算法连续 5 天有推进；睡眠比上周多 0.4 小时；待买没有超预算。</div>
        <div className="review-box"><strong>没做好</strong>周三和周五没有记录健康；系统设计任务拖了两天；饮水只有 4 天达标。</div>
        <div className="review-box"><strong>下周调整</strong>把系统设计拆成 25 分钟小块；睡前固定记录健康；待买冷静期结束前不新增数码类。</div>
      </div>
    </>
  );
}

/* ── App ────────────────────────────────────────────── */
function App() {
  const [page, setPage] = useState("overview");
  const [lifeTab, setLifeTab] = useState("shopping");
  const [learningTab, setLearningTab] = useState("plan");
  const [learningGoals, setLearningGoals] = useState(LEARNING_GOALS);
  const [theme, setTheme] = useState("light");

  const navigate = (next) => {
    setPage(next);
    window.scrollTo(0, 0);
  };
  const goLife = (tab) => {
    setPage("life");
    setLifeTab(tab);
    window.scrollTo(0, 0);
  };
  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <div className="app" data-theme={theme}>
      <Sidebar
        page={page}
        lifeTab={lifeTab}
        navigate={navigate}
        goLife={goLife}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="main">
        <div className="page">
          {page === "overview" ? <OverviewPage navigate={navigate} goLife={goLife} /> : null}
          {page === "learning" ? <LearningPage tab={learningTab} setTab={setLearningTab} goals={learningGoals} setGoals={setLearningGoals} /> : null}
          {page === "life" ? <LifePage tab={lifeTab} setTab={setLifeTab} /> : null}
          {page === "health" ? <HealthPage /> : null}
          {page === "review" ? <ReviewPage /> : null}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

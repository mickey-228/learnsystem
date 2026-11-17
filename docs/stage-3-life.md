# 阶段 3：生活域真实化

## 本阶段目标

把 C0 原型里的「生活」页接到真实后端：待买、资金项目、财务、习惯、日程，五个标签全部真实数据。

## 后端

### 数据表

- `life_shopping_items`：month、name、category、quantity、estimated_price、actual_price、priority、status(`want`/`bought`/`dropped`)、channel、reason、cooling_until、url、note、bought_at。
- `life_fund_projects` + `life_fund_entries`：目标金额、已存、截止、每月计划、投入记录。
- `finance_transactions`：date、type(`income`/`expense`)、amount、category、note。
- `habits` + `habit_checkins`：名称、归档、打卡（habit+date 唯一）。
- `schedule_events`：标题、日期、起止时间、地点、完成。

迁移 `9c3d2e1a4b58`：建新表，把旧 `life_proxy_purchases` 的数据迁移到 `life_shopping_items`（planned→want，bought/settled→bought），然后删除旧表。

### 接口

| 方法 | 路径 | 用途 |
|---|---|---|
| GET/PUT | `/api/life/months/{month}` `/budget` | 月视图（预算+条目+汇总）/ 预算 |
| POST | `/api/life/months/{month}/items` | 新增待买 |
| PATCH/DELETE | `/api/life/items/{id}` | 修改（含标记已买）/ 删除 |
| GET/POST | `/api/life/funds` `/{id}/entries` | 资金项目 / 投入 |
| PATCH/DELETE | `/api/life/funds/{id}` | 修改 / 删除 |
| GET/POST/DELETE | `/api/finance/transactions` `/{id}` | 交易 |
| GET | `/api/finance/summary?month=` | 月度收支汇总 |
| GET/POST/PATCH/DELETE | `/api/habits` `/{id}` `/{id}/toggle?date=` | 习惯与打卡 |
| GET/POST/PATCH/DELETE | `/api/schedule/events` `/{id}` | 日程 |

### 业务规则

- 标记已买必须填实际价格，自动记 `bought_at`；改回想买/放弃会清掉实际价格和购买日期。
- 已存金额达到目标金额时资金项目自动变为已完成。
- 习惯打卡按 (habit, date) 唯一，重复 toggle 是取消；连续天数从今天（或昨天）往回数。
- 日程结束时间必须晚于开始时间。

## 前端

- 新增 `/life` 页面，五个标签：待买、资金项目、财务、习惯、日程，全部 C0 视觉。
- 导航「代买」改为「生活」，路由 `/shopping` → `/life`；删除旧 `Shopping.tsx` 和 `api/life.ts` 旧语义。
- 待买：月份切换、预算设置、添加/编辑/标记已买（prompt 填实际价格）/放弃/恢复/删除。
- 资金：新建项目、投入（prompt 填金额）、进度条、自动完成。
- 财务：记一笔、月度收支卡片、分类支出占比、交易列表。
- 习惯：打卡 toggle、连续天数、新建/删除。
- 日程：添加、完成 toggle、删除。

## 测试

新增测试：`test_life.py`（待买+资金，6 个）、`test_finance.py`（2 个）、`test_habits.py`（2 个）、`test_schedule.py`（1 个）。

后端共 **20 个测试通过**，ruff 检查和格式检查通过。前端 build/lint/test 全部通过。

浏览器联调：设预算 ¥1000 → 添加待买 ¥399 → 标记已买 ¥350（prompt 输入）→ 汇总变成已花 ¥350/剩余 ¥650/已用 35%；资金项目创建后投入 ¥8000 进度 40%；习惯创建打卡连续 1 天；财务和日程页面正常。

## 下一步

1. 健康（睡眠/运动/饮水/体重/心情/生理期）。
2. 总览（六域卡片）和复盘。
3. 登录、Docker、公网部署。

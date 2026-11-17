# 规划：代买清单 + 每月预算

> 状态：已实现（本地，阶段 2 登录尚未完成）。
> 归属：独立的 `life` 域（生活），不并入学习闭环。

## 1. 定位

学习面板解决「今天学什么」。这个功能解决另一件每天会发生的小事：

```text
帮家人/室友代买 → 垫了多少钱 → 谁还没给 → 这个月有没有超预算
```

它和 `domains/learning` 平级，遵守同一条模块边界：按领域分目录、分表前缀、分路由。不为了它改造学习域，也不提前抽象通用记账引擎。

## 2. 目标

- 每月只设一次预算，随时能看到已花、待收、剩余。
- 代买条目能快速记录和改状态，不超过 1 分钟。
- 月底能直接回答：这个月代买花了多少、还有多少没收回来。

## 3. 范围

### 3.1 本期做（MVP）

| 能力 | 说明 |
|---|---|
| 月度预算 | 每月一条，金额 + 备注，可随时修改 |
| 代买条目 | 物品、数量、单价、总额、代买对象、日期、状态、备注 |
| 状态流转 | 待购买 → 已购买未收款 → 已收款 |
| 月度汇总 | 预算、已支出、待购买预估、待收款、剩余、使用率 |
| 按月切换 | 默认本月，可查看历史月份 |

### 3.2 明确不做

- 多用户、共享清单、权限
- 支付渠道对接、发票、库存
- 复式记账、分类账本、多币种
- 部分收款、分期、自动对账
- 提醒推送、AI 识别聊天记录
- 图表（等数据积累后再考虑）

## 4. 用户流程

1. 打开「代买」页，默认选中本月。
2. 第一次进入时设置本月预算（例如 1000 元）。
3. 新增代买条目：物品、数量、单价、代买对象。
4. 买完后把状态改为「已购买」，页面显示待收款金额。
5. 收到钱后改为「已收款」，待收款减少。
6. 顶部始终显示：预算、已支出、剩余、使用率。

## 5. 数据模型

### 5.1 `life_monthly_budgets`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Integer PK | |
| `month` | Date, unique, index | 统一存该月 1 号，例如 `2026-11-01` |
| `amount` | Numeric(10, 2) | 预算金额，>= 0 |
| `note` | Text, nullable | 备注 |
| `created_at` | DateTime(tz) | 复用 `utc_now` |
| `updated_at` | DateTime(tz) | `onupdate=utc_now` |

### 5.2 `life_proxy_purchases`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | Integer PK | |
| `purchase_date` | Date, index | 代买日期 |
| `item_name` | String(200) | 物品名称 |
| `quantity` | Integer, default 1 | 数量，>= 1 |
| `unit_price` | Numeric(10, 2) | 单价，>= 0 |
| `amount` | Numeric(10, 2) | 总额，默认数量 × 单价，允许手动覆盖（抹零/优惠） |
| `payee` | String(100), nullable | 代买对象，MVP 用文本 |
| `status` | String(20), default `planned` | `planned` / `bought` / `settled` |
| `note` | Text, nullable | 备注 |
| `created_at` | DateTime(tz) | |
| `updated_at` | DateTime(tz) | |

状态含义与统计口径：

| 状态 | 含义 | 计入已支出 | 计入待收款 |
|---|---|---|---|
| `planned` | 待购买 | 否 | 否 |
| `bought` | 已购买、未收款 | 是 | 是 |
| `settled` | 已收款 | 是 | 否 |

### 5.3 金额约定

- 数据库用 `Numeric(10, 2)`，避免浮点误差。
- API 的 schema 用 `float` 接收/返回，写入前保留两位小数；不引入多币种。
- 总额默认由后端按 `quantity * unit_price` 计算，前端可显式传 `amount` 覆盖。

## 6. 接口草案

沿用学习域「聚合读 + 资源写」的方式，前缀 `/api/life`。

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/life/months/{month}` | 月视图：预算 + 条目 + 汇总 |
| PUT | `/api/life/months/{month}/budget` | 新建或更新当月预算 |
| POST | `/api/life/months/{month}/purchases` | 新增代买条目 |
| PATCH | `/api/life/purchases/{id}` | 修改条目或状态 |
| DELETE | `/api/life/purchases/{id}` | 删除条目 |

`month` 用 `YYYY-MM`，后端解析为该月 1 号。

月视图响应示例：

```json
{
  "month": "2026-11-01",
  "budget": {
    "amount": 1000.0,
    "note": "本月代买预算"
  },
  "purchases": [
    {
      "id": 1,
      "purchase_date": "2026-11-03",
      "item_name": "牛奶",
      "quantity": 2,
      "unit_price": 12.5,
      "amount": 25.0,
      "payee": "妈妈",
      "status": "bought",
      "note": null
    }
  ],
  "summary": {
    "budget_amount": 1000.0,
    "spent_amount": 25.0,
    "planned_amount": 0.0,
    "receivable_amount": 25.0,
    "remaining_amount": 975.0,
    "usage_rate": 0.025,
    "counts": {
      "planned": 0,
      "bought": 1,
      "settled": 0
    }
  }
}
```

统计规则：

- `spent_amount` = `bought` + `settled` 的总额。
- `planned_amount` = `planned` 的总额。
- `receivable_amount` = `bought` 的总额。
- `remaining_amount` = 预算 − 已支出；没设预算时返回 `null`。
- `usage_rate` = 已支出 / 预算，保留 4 位小数；预算为 0 时返回 `null`。

## 7. 前端接入

| 文件 | 改动 |
|---|---|
| `frontend/src/pages/life/Shopping.tsx` | 新增代买页：月份切换、预算卡片、条目列表、新增/编辑/删除 |
| `frontend/src/api/life.ts` | 封装月视图、预算、条目的请求 |
| `frontend/src/components/Layout.tsx` | 导航增加「代买」 |
| `frontend/src/App.tsx` | 增加 `/shopping` 路由 |

约定：

- 月份放 URL 查询参数（`/shopping?month=2026-11`），刷新后保持。
- React Query key：`['life', 'month', month]`。
- 写操作成功后 `invalidateQueries` 这个 key，汇总自动重取。
- 复用 `api/client.ts` 的 `apiRequest` 和 `errorMessage`。

## 8. 阶段安排

放在**阶段 2（登录）之后**，记为阶段 2.5：

```text
阶段 2   登录 + 本地 Docker       ← 先保护数据
阶段 2.5 代买清单 + 每月预算       ← 本文档
阶段 3   规范导入 + AI 生成日计划
```

原因：这个功能涉及金额和个人往来，公网部署前必须已有登录保护；同时它不依赖 AI，不会阻塞阶段 3 的主线。

拆成三步：

1. **2.5a 后端**：`domains/life` 模型、Alembic 迁移、`api/life` 路由、service 汇总逻辑、pytest。
2. **2.5b 前端**：`pages/life/Shopping.tsx`、`api/life.ts`、导航与路由。
3. **2.5c 验收**：按第 9 节逐条手动验证，再跑后端与前端检查。

目录落点：

```text
backend/app/domains/life/     models.py, schemas.py, service.py
backend/app/api/life/         __init__.py, purchases.py, budgets.py
backend/app/api/router.py     include life 路由
backend/alembic/versions/     新增两张表的迁移
frontend/src/pages/life/      Shopping.tsx
frontend/src/api/             life.ts
```

## 9. 验收清单

- [ ] 能为某个月设置预算，重复设置会覆盖而不是新增。
- [ ] 能新增、编辑、删除代买条目。
- [ ] 总额默认等于数量 × 单价，手动改总额后不再被覆盖。
- [ ] 状态从 `planned` 改到 `bought`，已支出和待收款同时增加。
- [ ] 状态从 `bought` 改到 `settled`，待收款减少、已支出不变。
- [ ] 切换月份后只看到该月条目，预算与汇总各自独立。
- [ ] 删除预算不会删除该月代买条目。
- [ ] 刷新页面后数据仍然存在。
- [ ] 后端 `uv run pytest`、`uv run ruff check .` 通过。
- [ ] 前端 `npm run build`、`npm run lint` 通过。

## 10. 风险与默认决策

| 问题 | 默认决策 |
|---|---|
| 代买对象是否独立建表 | MVP 先用文本字段；出现按人统计的需求再抽 `life_payees` |
| 金额精度 | 数据库 `Numeric(10, 2)`，API 用两位小数 |
| 月份边界/时区 | 先按本地月份；阶段 2 统一时区后再细化 |
| 同月重复预算 | `month` 唯一，`PUT` 覆盖 |
| 删除预算 | 只删预算，保留条目 |
| 部分收款 | 不做，先记在备注里 |
| 是否需要分类 | 不做；等条目量足够大再加 |
| 公网暴露 | 必须在阶段 2 登录完成之后 |

## 11. 与现有约定的一致性

- 表名用领域前缀：`life_*`。
- 接口路径用领域前缀：`/api/life/*`。
- 页面按领域分目录：`pages/life/*`。
- 时间字段统一用 `utc_now`；纯日期字段不带时区。
- 读单个资源用 `service.get_*`，找不到抛 404，与学习域一致。
- 月视图参照 `DayPlanRead` 的聚合方式：一次请求返回详情 + 汇总。

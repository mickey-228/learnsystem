# 阶段 1：薄切片（目标 + 今日计划 + 打卡 + 今日进度）

## 本阶段目标

让系统第一次真正「能每天用」：建目标、给今天加任务、完成后打卡、看到今天的完成率和实际时长。

这一阶段故意**不接 AI**，先把数据流跑通。AI 只有在手动流程稳定后介入，才不会掩盖问题。

## 你学到的东西

### 1. 关系型数据库

数据存在表里，表之间用外键关联：

```
learning_goals
   ↑ goal_id（可空）
learning_subjects
   ↑ subject_id（可空）
learning_day_plans ──1:N── learning_plan_items
                                ↑ plan_item_id（可空）
                          learning_checkins
```

- 一个目标可以关联多个科目
- 一天有一个计划，计划里有多条任务
- 完成一条任务会生成一条打卡记录
- 重开任务会撤销对应打卡，保证统计不重复

### 2. ORM：用 Python 类操作表

`backend/app/domains/learning/models.py` 里每个类对应一张表。SQLAlchemy 把「对象操作」翻译成 SQL：

```python
item = LearningPlanItem(title="两数之和", estimated_minutes=30)
db.add(item)
db.commit()
```

好处是类型清晰、关系可组合；坏处是仍然要理解底层 SQL 和事务。

### 3. 数据库迁移

表结构不是手改数据库，而是用 Alembic 记录版本：

```powershell
uv run alembic upgrade head
```

以后每次改模型，都要生成新迁移，保证本地和服务器结构一致。

### 4. REST 接口

后端把能力暴露成资源路径：

- `GET /api/learning/plans/2026-11-09`：读当天计划
- `POST /api/learning/plans/2026-11-09/items`：加任务
- `POST /api/learning/plan-items/3/complete`：完成任务

前端不直接连数据库，只调用这些接口。以后接入登录、AI、移动端都复用同一套接口。

### 5. React Query：服务端状态管理

前端用 `useQuery` 读数据，用 `useMutation` 写数据：

```tsx
const planQuery = useQuery({
  queryKey: ['plan', today],
  queryFn: () => learningApi.getPlan(today),
})

const addItem = useMutation({
  mutationFn: () => learningApi.createPlanItem(today, payload),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan', today] }),
})
```

写入成功后让对应查询失效，React Query 会自动重新请求，页面数字就更新了。不需要手动维护 `loading`、错误和缓存。

### 6. 日期与「今天」

浏览器和后端都可能跨时区。这一版前端用本地日期生成 `YYYY-MM-DD`，后端按这个字符串存 `Date`。阶段 2 之后会把时区和日界线做成配置，照顾熬夜学习的情况。

## 关键文件

| 文件 | 作用 |
|---|---|
| `backend/app/shared/db.py` | 数据库连接、WAL、会话依赖 |
| `backend/app/domains/learning/models.py` | 5 张表与关系 |
| `backend/app/domains/learning/schemas.py` | 请求/响应模型与校验 |
| `backend/app/domains/learning/service.py` | 计划、打卡、汇总的业务逻辑 |
| `backend/app/api/learning/*.py` | 目标、科目、计划、打卡接口 |
| `backend/alembic/versions/` | 建表迁移 |
| `frontend/src/pages/learning/Today.tsx` | 今日计划与打卡 |
| `frontend/src/pages/learning/Goals.tsx` | 目标管理 |
| `frontend/src/pages/learning/Subjects.tsx` | 科目管理 |

## 启动顺序

```powershell
# 第一次
cd backend
uv sync
uv run alembic upgrade head
```

```powershell
# 终端 1
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

```powershell
# 终端 2
cd frontend
npm install
npm run dev
```

## 验收清单

- [ ] 能创建一个带总量和截止日期的目标
- [ ] 能创建一个科目并关联目标
- [ ] 能在「今日」添加任务，选择科目、预计时长、优先级
- [ ] 点「完成」后状态变成已完成，实际时长可改
- [ ] 顶部「完成 / 完成率 / 实际与预计时长」立即更新
- [ ] 点「重开」后任务回到待完成，打卡记录被撤销
- [ ] 刷新页面后数据还在
- [ ] `uv run pytest` 通过
- [ ] `npm run build` 和 `npm run lint` 通过

## 小练习

1. 给任务加一个「备注」字段，从模型、迁移、接口到前端完整走一遍。
2. 在今日页显示当天所有打卡记录（调用 `GET /api/learning/checkins?date=`）。
3. 让完成任务的弹窗支持填写自评分（1–5），并显示在打卡记录里。
4. 思考：如果两个浏览器同时点「完成」，会不会生成两条打卡？怎么防？

## 常见问题

**接口返回 422**

请求体字段不符合 Pydantic 规则（缺必填、类型不对、超范围）。看返回的 `detail`，或打开 http://127.0.0.1:8000/docs 直接试。

**数据库改了但页面没变**

确认迁移已执行；确认 React Query 的 `invalidateQueries` key 与查询 key 一致。

**日期对不上**

前端按本地日期生成；后端存的是纯日期，不带时区。跨时区或凌晨学习的问题在阶段 2 统一处理。

## 下一步

阶段 2 加单密码登录和本地 Docker。先保护数据，再让 AI 接入，避免 API Key 和数据库裸奔。

# 个人学习面板

一个单人使用的学习管理面板。当前按阶段推进，先做好「学习闭环」，未来再扩展知识库、健康、生活等领域。

正在扩展为**个人生活面板**：学习 + 待买 + 健康，目标是量化日常生活。需求见 [`docs/product-requirements.md`](docs/product-requirements.md)。

## 当前进度

| 阶段 | 内容 | 状态 |
|---|---|---|
| 0 | 环境与脚手架 | 完成 |
| 1 | 薄切片：目标 + 今日计划 + 打卡 + 今日进度 | 完成 |
| 1.5 | 学习核心：任务库 + 番茄钟/时间记录 + 目标编辑 | 完成（本地） |
| 1.6 | Obsidian 笔记：vault 配置 + 同步 + 标签索引 | 完成（本地） |
| 1.7 | C0 全局视觉换壳 + 深色模式 + 前端测试基建 | 完成（本地） |
| 1.8 | 生活域：待买/资金项目/财务/习惯/日程 | 完成（本地） |
| 2 | 登录 + 本地 Docker | 待开始 |
| 2.5 | 代买清单 + 每月预算 | 已并入 1.8（待买 + 资金项目） |
| 3 | 规范导入 + AI 生成日计划 | 待开始 |
| 4 | 看板与目标距离 | 待开始 |
| 5 | AI 复盘与调整 | 待开始 |
| 6 | 公网部署 | 待开始 |

完整计划：`C:\Users\ASUS\.commandcode\plans\learning-dashboard.md`
阶段 2.5 规划：[`docs/feature-shopping-budget.md`](docs/feature-shopping-budget.md)
阶段 1.5 记录：[`docs/stage-1-learning-core.md`](docs/stage-1-learning-core.md)
阶段 2 记录：[`docs/stage-2-obsidian.md`](docs/stage-2-obsidian.md)
阶段 3 记录：[`docs/stage-3-life.md`](docs/stage-3-life.md)

## 目录结构

```
backend/    FastAPI 后端
frontend/   React + TypeScript 前端
docs/       每阶段学习笔记
```

## 环境要求

- Python 3.12（由 `uv` 自动管理）
- Node.js 20+
- `uv`（Python 包管理器）

## 启动后端

首次运行先建表：

```powershell
cd backend
uv sync
uv run alembic upgrade head
```

启动服务：

```powershell
uv run uvicorn app.main:app --reload --port 8000
```

- 健康检查：http://127.0.0.1:8000/api/health
- 接口文档：http://127.0.0.1:8000/docs
- 数据库文件：`backend/learnsystem.db`（已被 git 忽略）

## 启动前端

```powershell
cd frontend
npm install
npm run dev
```

打开 http://127.0.0.1:5173 ，可以看到「今日 / 目标 / 任务 / 笔记 / 生活」五个页面。

## 当前接口

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| GET/POST | `/api/learning/goals` | 目标列表 / 新建 |
| PATCH/DELETE | `/api/learning/goals/{id}` | 修改 / 删除目标 |
| GET/POST | `/api/learning/subjects` | 科目列表 / 新建 |
| PATCH/DELETE | `/api/learning/subjects/{id}` | 修改 / 删除科目 |
| GET | `/api/learning/plans/{date}` | 某天的计划与汇总 |
| POST | `/api/learning/plans/{date}/items` | 添加任务 |
| PATCH/DELETE | `/api/learning/plan-items/{id}` | 修改 / 删除任务 |
| POST | `/api/learning/plan-items/{id}/complete` | 完成任务并生成打卡 |
| POST | `/api/learning/plan-items/{id}/reopen` | 重开任务并撤销打卡 |
| GET | `/api/learning/checkins?date=` | 某天的打卡记录 |
| GET | `/api/learning/tasks?from_date=&to_date=` | 按日期范围查任务 |
| GET/POST | `/api/learning/time-sessions` | 时间记录列表 / 新建 |
| DELETE | `/api/learning/time-sessions/{id}` | 删除时间记录 |
| GET | `/api/knowledge/obsidian/status` | Obsidian vault 状态 |
| PUT | `/api/knowledge/obsidian/config` | 保存 vault 配置 |
| POST | `/api/knowledge/obsidian/sync` | 扫描 vault 并更新索引 |
| GET | `/api/knowledge/notes?tag=&q=` | 笔记列表与过滤 |
| GET | `/api/life/months/{month}` | 月视图（预算+待买+汇总） |
| PUT | `/api/life/months/{month}/budget` | 新建 / 更新月度预算 |
| POST | `/api/life/months/{month}/items` | 新增待买 |
| PATCH/DELETE | `/api/life/items/{id}` | 修改 / 删除待买 |
| GET/POST | `/api/life/funds` `/{id}/entries` | 资金项目 / 投入 |
| PATCH/DELETE | `/api/life/funds/{id}` | 修改 / 删除资金项目 |
| GET/POST/DELETE | `/api/finance/transactions` `/{id}` | 交易 |
| GET | `/api/finance/summary?month=` | 月度收支汇总 |
| GET/POST/PATCH/DELETE | `/api/habits` `/{id}` `/{id}/toggle` | 习惯与打卡 |
| GET/POST/PATCH/DELETE | `/api/schedule/events` `/{id}` | 日程 |

## 测试与检查

```powershell
# 后端
cd backend
uv run pytest
uv run ruff check .
uv run ruff format --check .

# 前端
cd frontend
npm run build
npm run lint
npm run test
```

## 学习笔记

- [学习规范与知识地图](docs/learning-guide.md)
- [阶段 0：环境与脚手架](docs/phase-0.md)
- [阶段 1：薄切片](docs/phase-1.md)
- [阶段 1.5：学习核心](docs/stage-1-learning-core.md)
- [阶段 2：Obsidian 笔记](docs/stage-2-obsidian.md)
- [规划：代买清单 + 每月预算](docs/feature-shopping-budget.md)
- [个人生活面板需求文档](docs/product-requirements.md)

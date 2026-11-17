# 阶段 0：环境与脚手架

## 本阶段目标

让前端和后端分别跑起来，并且能通过一个 HTTP 接口互相通信。

完成后你应该能回答：

- 前端和后端分别负责什么？
- 浏览器里的页面是怎么拿到后端数据的？
- `uv`、`npm` 分别在管理什么？

## 你学到的东西

### 1. 什么是 API

API 是前后端之间的约定。后端暴露一个地址，前端按约定发请求，后端返回数据。

本阶段的最小 API：

```
GET /api/health  →  {"status": "ok"}
```

`GET` 是请求方法，`/api/health` 是路径，返回的 JSON 是数据。

### 2. 前后端如何通信

```
浏览器 → Vite 开发服务器 (5173) → 代理 /api → FastAPI (8000)
```

浏览器只访问 5173。Vite 发现请求以 `/api` 开头，就转发给 8000 端口。这样开发时不需要处理跨域，生产环境也可以让反向代理做同样的事。

对应配置在 `frontend/vite.config.ts`：

```ts
server: {
  proxy: {
    '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  },
}
```

### 3. 依赖管理

- 后端：`uv` 读取 `pyproject.toml`，把依赖装进 `backend/.venv`，并生成 `uv.lock` 锁定版本
- 前端：`npm` 读取 `package.json`，把依赖装进 `frontend/node_modules`

依赖文件要提交到 git，`node_modules/` 和 `.venv/` 不要提交。

### 4. 为什么用 TypeScript

TypeScript 是带类型检查的 JavaScript。写错字段名或类型时，`npm run build` 会提前报错，而不是等到浏览器里才出问题。

## 关键文件

| 文件 | 作用 |
|---|---|
| `backend/app/main.py` | FastAPI 入口，注册 `/api/health` |
| `backend/app/shared/config.py` | 读取环境变量 |
| `backend/tests/test_health.py` | 健康检查的自动化测试 |
| `frontend/src/App.tsx` | 请求 `/api/health` 并显示状态 |
| `frontend/vite.config.ts` | React、Tailwind 插件与 `/api` 代理 |
| `frontend/src/index.css` | Tailwind 入口 |

## 启动命令

后端：

```powershell
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

前端（另开一个终端）：

```powershell
cd frontend
npm install
npm run dev
```

## 验收清单

- [ ] `uv run pytest` 通过
- [ ] `uv run ruff check .` 无报错
- [ ] `npm run build` 成功
- [ ] `npm run lint` 无报错
- [ ] 打开 http://127.0.0.1:5173 ，页面显示「后端状态：ok」
- [ ] 停掉后端后刷新页面，显示「连接失败」

## 小练习

1. 给 `/api/health` 增加一个 `version` 字段，并在前端显示出来。
2. 新增 `GET /api/hello?name=你的名字`，返回一句问候，并在前端加一个输入框调用它。
3. 故意把前端请求路径改成 `/api/health2`，观察错误提示，再改回来。

## 常见问题

**端口被占用**

```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

找到 PID 后结束进程，或换一个端口启动。

**前端装不上开发依赖**

如果环境变量 `NODE_ENV=production`，npm 会跳过 devDependencies。用：

```powershell
npm install --include=dev
```

**页面显示连接失败**

确认后端在 8000 端口运行，且 `vite.config.ts` 的代理地址正确。

## 下一步

阶段 1 会开始建数据库：目标、今日任务、打卡。先把每天手动安排学习的流程跑通，再让 AI 介入。

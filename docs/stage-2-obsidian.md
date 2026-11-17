# 阶段 2：Obsidian 笔记接入

## 本阶段目标

把原型里的「笔记」标签接到真实的 Obsidian vault：

- 配置 vault 名称和本地路径。
- 后端扫描 Markdown，建立只读索引。
- 前端按标题/路径搜索，按标签过滤。
- 点击笔记在 Obsidian 里打开。

## 后端

### 数据表

- `knowledge_vaults`：name、path、sync_mode、last_synced_at、enabled。
- `knowledge_notes`：vault_id、path、title、tags_json、modified_at、indexed_at。
  - `(vault_id, path)` 唯一。

迁移：`77754bbf87d0_add_knowledge_vaults_and_notes.py`。

### 接口

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/knowledge/obsidian/status` | vault 状态、笔记数、最近同步 |
| PUT | `/api/knowledge/obsidian/config` | 保存 vault 名称和路径 |
| POST | `/api/knowledge/obsidian/sync` | 扫描 vault，更新索引 |
| GET | `/api/knowledge/notes?tag=&q=` | 笔记列表、标签/关键词过滤 |

### 扫描规则

- 只扫描 `.md`，跳过隐藏目录（如 `.obsidian`）、附件和符号链接。
- 单文件最大 2MB，最多索引 5000 篇。
- 标题：frontmatter `title:` → 第一个 `# 标题` → 文件名。
- 标签：frontmatter `tags:`（数组或逗号分隔） + 正文里的 `#tag`。
- 同步是幂等的：标题/标签/修改时间没变就不算更新；缺失文件会从索引删除。
- 路径只保存在本地数据库，不上传。

## 前端

新增 `/notes` 页面：

- 未连接时显示 vault 名称、路径、同步方式表单。
- 已连接时显示笔记数、最近同步时间、同步按钮、打开 Obsidian。
- 笔记列表：标题、路径、标签、更新时间、在 Obsidian 打开。
- 搜索标题/路径，标签按钮过滤。
- 导航增加「笔记」。

## 测试

后端新增 `tests/test_knowledge.py`，覆盖：

- 未配置时的状态接口。
- 配置 vault、拒绝不存在的路径。
- 扫描 3 篇笔记，跳过 `.obsidian` 和附件。
- 标题和标签解析（H1、frontmatter、正文 #tag）。
- 重复同步幂等。
- 新增文件、修改文件、删除文件后的同步结果。
- 标签过滤和关键词搜索。
- 未配置时同步返回 400。
- `rest_api` 模式暂不支持扫描，返回 400。

当前后端共 **16 个测试通过**，ruff 检查和格式检查通过。

前端验证：

- `npm run build` 通过。
- `npm run lint` 0 warning / 0 error。
- 浏览器联调：临时 vault 同步出 2 篇笔记，列表、标签、打开链接正常。

## 补充：C0 全局换壳与测试基建（本阶段内完成）

- 新增 `src/styles/c0.css`：变量挂在 `:root`，深色模式挂在 `html[data-theme="dark"]`。
- `Layout.tsx` 换成 C0 侧栏壳：品牌「小生活」、五个导航项、深浅色切换（localStorage 记忆）。
- 今日 / 目标 / 任务 / 笔记 四个页面全部换成 C0 卡片视觉；代买页保留旧样式，等生活域重构时一起换。
- 新增 Vitest 测试基建：`vite.config.ts` 加 `test` 配置，`npm run test` 运行。
- 测试用例：`src/api/date.test.ts`（12 个）、`src/lib/tasks.test.ts`（6 个，任务分组逻辑抽到 `src/lib/tasks.ts`）。
- npm 全局配置了 `omit=dev`，安装依赖时需要 `npm install --include=dev`。

## 下一步

1. 生活域真实化：待买、资金项目、财务、习惯、日程。
2. 健康、总览、复盘。
3. 登录、Docker、公网部署。
4. 如需组件级测试，再补 Testing Library 用例。

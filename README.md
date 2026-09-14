# EARTH — Player Manual

现实世界玩家手册。不是百科换皮，而是从一个现实问题，看见它背后的系统、关系和可检验解释。

首轮只做“一块面包的旅程”：**12 个互联系统、2 个预设问题配方、3 个任务阶段**。交互、信息架构、视觉和学习闭环优先于条目数量。

## 直接看效果

源码仓库通过 GitHub Actions 自动验证，并可从 `main` 分支构建后部署到 GitHub Pages。下载交付包如果包含 `dist/`，可直接用浏览器打开 `dist/EARTH-player-manual.html`；它是自包含的离线 HTML，无需账户或 API Key，查看外部来源才需要联网。

也可在项目目录运行以下命令，通过本机 HTTP 预览现成构建（仅需要 Node.js 22 或以上）：

```sh
node scripts/dev.mjs --dist
```

随后打开 `http://127.0.0.1:4173`。不要直接双击根目录的 `index.html`：根文件使用原生 ES modules，供 HTTP 服务使用；离线单文件是 `dist/EARTH-player-manual.html`。

浏览器存储可用时，进度与观察草稿只保存在本地。禁用存储或配额不足时退化为当前会话；清除浏览器数据会删除记录。文件模式下的持久性因浏览器而异，需用目标浏览器确认。

## 开发与验证

技术栈是原生 TypeScript + CSS + SVG，没有运行时依赖。唯一开发依赖为锁定版本 TypeScript 5.8.3。

```sh
npm install
npm run dev
```

开发服务启动时编译一次，不包含热更新。修改源代码后，在另一终端运行 `npx tsc --watch` 并手动刷新；修改 CSS 不需编译。

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

`lint` 是严格 TypeScript 检查加项目级源码规则，不是完整 ESLint 或无障碍审计。`build` 同时生成原生 ESM 静态站和独立离线 HTML。离线链接器只支持当前项目的命名静态 import/export；遇到不支持的语法会停止构建。

交付环境已实际运行全套命令，使用的是环境中现成的 TypeScript 5.8.3。没有在该环境中完成从 npm 注册表重新安装依赖的验证。

## 一条完整路线

首页 → 提出现实问题 → 图集高亮相关系统 → 打开机制说明 → 回到现场任务 → 先预测再揭示教学模型 → 错误解释与重试 → 写下观察、推断、未知 → 完成并进入下一条自由探索关系。

地图的物品流、支持关系、可能反馈，与学习前置条件分开建模。价格问题不是单一因果链。所有文章始终可读；阅读不等于掌握。现实观察标为“本人报告，未独立核验”。

快捷键：`Ctrl/Cmd + K` 搜索，方向键选择结果，`Enter` 打开，`Esc` 关闭。地图支持拖动、缩放、复位，以及获得焦点后的方向键平移、`+/-` 缩放、`0` 复位。移动端使用独立的聚焦节点浏览器。

## 修改内容与界面

- `src/content.ts`：12 个概念、来源、关系、问题配方，以及任务顺序与标题。
- `src/types.ts`、`src/model.ts`：类型、索引、搜索排序、模型计算、进度校验。
- `src/atlas.ts`、`guide.ts`、`search.ts`：三种访问同一份内容的视图。
- `src/quests.ts`、`experiment.ts`：三阶段任务及教学实验；当前问题表单为明确的手工设计，不是通用题库。
- `src/app.ts`、`ui.ts`、`style.css`：导航、共享界面、视觉系统。

详见 `docs/content-model.md`。增加条目不需复制 UI。当前未实现云同步、CMS、实时 AI、通用问答、账号或千级图谱加载；不是做好的功能被隐藏。

## 验证范围与交付状态

见 `docs/qa-report.md`。浏览器检查执行了构建后的真实 HTML/JS，但当前环境的管理策略禁止一切 URL 导航，因此使用 Playwright `set_content` 加载生产文件，不更改策略。桌面/移动布局、图谱交互、搜索、任务闭环、会话内状态和草稿均有检查；**原生跨刷新持久化、真实 file:// 打开、上线后的访问与人类学习效果尚未验证**。

仓库保留了首轮 vertical slice 的 Git 检查点。`.github/workflows/verify.yml` 会在 push / PR 时执行类型检查、源码检查、测试与生产构建；`.github/workflows/pages.yml` 会在 `main` 更新后构建 `dist/` 并部署 GitHub Pages。

静态部署时发布 `dist` 目录即可。若平台要求 `index.html`，使用 `dist/index.html` 并保留相邻 `build/` 与 `style.css`；也可将独立 HTML 复制为另一空部署目录的 `index.html`。首次使用 GitHub Pages 时，需要在仓库 Settings → Pages 中将发布源设为 **GitHub Actions**。

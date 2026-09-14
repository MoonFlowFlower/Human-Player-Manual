# EARTH — Player Manual

现实世界玩家手册。理解生活，也理解世界怎样运转。

首页以**人生知识路线图**为入口：照顾自己、学习与判断、独立生活、人际合作、理解世界、做选择。前两个方向优先展示，可以并行阅读；其他方向连接已完成的内容，未完成主题只有说明，没有空文章入口。

## 本轮可以体验什么

基础章节共七篇：睡眠与休息、吃饭与活动、安排注意力、从看懂到会做、回忆与复习、判断信息、怎样求助。睡眠和记忆内容区分日常尝试与需要医疗评估的情况，默认面向普通成年读者。

一条可以在站内走完的练习：读借伞示例 → 收起原文回忆 → 自己对照三个要点 → 换个情境应用 → 查看错误解释并重试 → 继续读记忆章节或加入稍后复习。自由文字由读者对照，不伪装成 AI 评分；完成只表示做过这次练习。

已有的面包、物流、价格及其知识地图仍在「看懂世界怎样运转」中。`#guide/food`、`#guide/prices`、`#quests/trace` 等旧链接继续有效；`#guide` 本身现在打开学习路线。知识地图展示现实系统关系，不作为学习关卡。

## 开发与构建

保持原生 **TypeScript + CSS + SVG**，没有应用运行时依赖。Node.js 22 或以上，开发依赖锁定 TypeScript 5.8.3。

```sh
npm ci
npm run dev
```

打开 `http://127.0.0.1:4173`。开发服务启动时编译一次；修改 TypeScript 后需重新编译，可另开终端运行 `npx tsc --watch`。CSS 修改后刷新即可。

```sh
npm run typecheck
npm run lint
npm test
npm run build
node scripts/dev.mjs --dist
```

`lint` 是严格类型检查加项目级源码规则，不是完整 ESLint 或无障碍审计。`build` 输出 `dist/` 静态站与 `dist/EARTH-player-manual.html` 自包含离线页面；没有引入新技术栈。离线链接器仍只支持本项目的命名静态 import/export。

## 浏览器回归

```sh
python -m pip install playwright==1.57.0
python -m playwright install chromium
# 先在另一终端启动上面的 --dist 服务：
python qa/browser_check.py --base-url http://127.0.0.1:4173
python qa/interaction_regressions.py
```

`CHROMIUM_PATH` 可指定现成 Chromium。导航受限制的环境可运行 `python qa/browser_check.py --offline`，在新页面中加载构建后的独立 HTML；该模式**不验证 HTTP、原生刷新或 localStorage 持久化**。它不会修改浏览器管理策略。

`qa/results/` 保存报告与 1440×900、390×844 截图，不进入源码版本。Verify 工作流执行工程检查、真实 HTTP 浏览器流程并上传构建/QA 产物。详见 [验证说明](docs/qa-report.md)。

## 内容与状态的位置

| 文件 | 用途 |
|---|---|
| `src/learning-content.ts` | 基础章节、六个方向、具名来源、学习关系与练习数据 |
| `src/content.ts` | 保留的世界系统、物品/支持/反馈关系、面包与价格问题 |
| `src/learning-model.ts` | 方向上下文、下一篇、学习状态校验、回忆练习完成条件 |
| `src/learning-ui.ts` / `src/practice.ts` | 路线/章节与回忆练习界面 |
| `src/atlas.ts` / `src/guide.ts` / `src/quests.ts` | 保留的知识地图、世界条目与独立小练习 |
| `src/model.ts` / `src/search.ts` | 共享本地检索、人工别名、旧记录校验与搜索交互 |
| `src/app.ts` / `src/ui.ts` / `style.css` | 导航、共享界面与原有视觉语言 |

详细结构与兼容策略见 [内容模型](docs/content-model.md)。

## 本地记录与隐私

新记录使用 `earth-player-manual.learning.v2`，旧面包记录仍使用 `earth-player-manual.v1`。不把旧任务完成映射成新课已读或练习完成；新章节操作不重写旧记录。已读、已跳过、练习完成、笔记草稿与观察提交分别表示对应行为。

笔记不由本站上传，没有账号、数据库、云同步或 AI 接口。禁用存储或配额不足时退为当前会话，并显示提示；清理浏览器数据会删除记录。网页内有单条笔记删除、旧练习重置和全部记录删除，均有确认或明确作用范围。不要填写病史、地址或账户资料。

## 发布

`.github/workflows/verify.yml` 对 PR、main 更新执行验证；`.github/workflows/pages.yml` 仅在 main 更新或手动触发时部署 `dist/` 到 GitHub Pages。修改分支与 PR 本身**不会自动替换公开网站**。

GitHub Pages 发布源应为 **GitHub Actions**。代码提交、远端内容、Verify 结果与 Pages 部署结果是不同状态，需要分别查看。静态站资源均使用相对路径，兼容 `/Human-Player-Manual/` 子路径。

# 内容与记录模型

## 两种入口，共享内容引用

- 学习路线回答「现在学什么」。`Direction.readings` 是建议阅读顺序，引用 `{kind:'chapter'|'concept', id}`，不复制正文。
- 知识地图回答「事物怎样联系」。继续使用 `Concept` 与 `Edge`；当前地图只画已有世界系统，不把生活章节伪装成物品流节点。
- 基础章节在 `Chapter` 中，以情境、机制、例子、尝试、适用条件和来源组织。栏目可按内容调整，不要求套用世界条目的输入输出结构。
- `relatedReadings()` 根据同一份关联数据，在新章节、旧世界文章与地图详情中提供双向入口。

所有实际入口必须引用已存在内容。`Direction.planned` 只渲染无链接的主题说明，没有占位文章。添加章节时更新索引与验证，不另外维护搜索正文副本。

## 关系不是解锁条件

`Edge.type`：`flow`（物品流）、`support`（支持）、`feedback`（可能反馈）。

`LearningRelation.type`：`recommended`（建议顺序）、`prerequisite`（真正前置知识）、`related`（相关阅读）。使用 `chapter:sleep` / `concept:food` 等具名引用。当前基础路线没有强制前置条件，推荐顺序不限制访问。

旧 `Concept.prerequisites` 实际表示阅读建议，现更名为 `recommendedBefore`，避免把建议误作严格依赖。世界知识关系仍独立于学习推荐。价格问题使用 `relationMode:'context'`，不画成一条因果链。

## 路由与继续阅读

- `#home`、`#routes`、`#routes/study`：首页、总览、具体方向。
- `#learn/memory?route=study`：基础章节与进入方向。`nextReading()` 按该方向找下一篇，结束时回到该方向。
- 同一篇求助文章可被多个方向引用；在 `people` 中继续到劳动与协作，在 `care` 中回到照顾自己，而不是跳入食物主线。
- `#guide/food` 等旧世界文章保留；无 id 的 `#guide` 打开路线总览。
- `#practice` / `#practice/recall`：练习总览与回忆练习。旧 `#quests/trace|predict|observe` 均可直接进入，不再强制按三步解锁。
- 非法 id 显示「没有找到这一页」，提供路线与搜索。

`validLearningLocation()` 只保存已存在的章节/练习路径，不接受外部 URL；首页据此提供继续入口。搜索为本地检索，手工别名包括「睡不醒」「看完记不住」「不知道先学什么」，无结果时不生成答案。

## 新学习状态

存储键：`earth-player-manual.learning.v2`。

```ts
{
  version: 2,
  read: string[],       // 点击「标为已读并继续」
  skipped: string[],    // 点击「跳过本节」，与已读去重
  notes: { sleep?: string },
  lastLocation: string,
  reviewLater: boolean,
  recall: {
    stage: 'example'|'recall'|'compare'|'transfer'|'complete',
    response: string,
    comparison: ('included'|'missed'|'unsure')[],
    answer: string,
    attempts: number,
    completed: boolean
  }
}
```

打开文章不会自动标为已读。睡眠记录必须显式保存；回忆输入保存草稿。完成练习必须有回忆文字、三个有效自我对照和正确的迁移判断，不能只改一个 completed 标志取得完成状态。自我对照不是自动判断文字，迁移题有确定规则与针对具体误解的反馈。

恢复时限制字符串长度、过滤未知 id、校验阶段前置行为、拒绝损坏 JSON 和错误版本。记录只代表行为，不推断健康改善或长期掌握。稍后复习只是本地入口，不调度通知。

## 旧数据兼容

保留原键 `earth-player-manual.v1`、原 version 1 和原 known note keys。**不跨版本映射完成状态，不自动清空旧笔记。** 新基础章节操作只写 v2；旧世界条目的「曾打开」与练习仍写 v1。写回 v1 时保留未知笔记字段，避免抹掉用户原有数据。

旧 completed 现在按有效 id 去重保留，不再强制裁成三步前缀，这是让三个旧练习可分别尝试的有意变更。未知任务仍不允许完成。睡眠记录删除只清除该条；旧练习重置只清除 v1；隐私页的全部删除才清除两键，均按界面确认操作执行。

存储失败时显示会话模式；不把保存失败说成已持久保存。纯离线 HTML 在不同浏览器下的存储策略可能不同，不能由 HTTP 测试推断。

## 来源与安全

来源含发布者、标题、URL、适用范围、实际查阅日期。健康章节以普通成年读者为默认，NHS 就诊方式、加拿大饮食资料分别注明地区。文章提供相关段落的资料跳转；较长说明放在资料列表/关于/隐私，不铺满每一屏。

日期表示编辑时查阅，不等于临床、教育或同行审核；例子与价格模型的参数明确为编写的教学假设。公开内容不得取用用户私人健康或身份资料。没有对应交互练习的世界条目保留思考题，不提供指向不相关面包练习的按钮。

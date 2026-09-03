# devflow 蒸馏推导账目

> 回答三个问题:每个部件从哪来、改了什么;舍弃了什么、为什么;关键取舍是如何做出的。
> 与 `03-distilled-workflow-design.md`(实施契约)配套阅读。

## 一、来源分层

所有部件可归为三层:**skills 项目**(操作剧本)、**superpowers 项目**(行为纪律与机制)、**新造**(为个人场景设计,两边都没有)。蒸馏不是拼盘——每个借来的部件都经过"改写以适配轻形态"处理。

## 二、从 skills 项目蒸馏(7 项)

| devflow 部件 | 来源技能 | 保留 | 改写 | 舍弃 |
|---|---|---|---|---|
| `grilling` | `grilling` | 设计树、轮次、前沿批量提问、每题附推荐答案、事实/决策分工、frontier 空即共识 | 访谈覆盖范围绑定设计文档章节 | 无仓库场景的 grill-me 变体 |
| `domain-docs` | `domain-modeling` | 五会话动作、纯词汇表、ADR 三条件、就地更新 | 取代协议明确成文 | 多上下文 CONTEXT-MAP |
| `tdd` 接缝纪律 | `tdd`+`to-spec` | 预约定接缝、三反模式 | 接缝确认移入门 1 设计文档 | — |
| 曳光弹计划 | `to-tickets` | 四切片规则、prefactoring、依赖声明 | 盘问三连→门 2 修订循环;DAG→线性依赖 | expand–contract 宽重构协议 |
| `debugging` | `diagnosing-bugs` | 回路先行、复现率优先、可证伪假设、回归测试先于修复、"无接缝是发现"、三次失败=架构、DBG- 前缀、根因进 commit | 六阶段→四步;10 种回路手段→3 类 | HITL 人肉回路脚本 |
| `dev-review` | `improve-codebase-architecture` | 热点定范围、摩擦信号、删除测试、调查不抢救、强度徽章、ADR 冲突标注 | HTML 报告→Markdown;选中后路由进 /dev | Tailwind/Mermaid 可视化 |
| 分类器 | `ask-matt` | 路由思想 | 全地图路由→信号清单+问一句 | 独立路由技能形态 |

## 三、从 superpowers 项目蒸馏(8 项)

| devflow 部件 | 来源技能 | 保留 | 改写 | 舍弃 |
|---|---|---|---|---|
| `verification` | `verification-before-completion` | 新鲜验证、对照表、禁用语、不信自述、红绿验证 | 删心理疲劳条目 | — |
| `code-review` | `requesting/receiving-review`+SDD 评审 | 不自审放行、不信报告、file:line、三级分级、范围收窄复审、worker 不派子代理、先扬后抑 | 双子代理→单评审者双节输出 | 双轴 Standards 轴的 Fowler 12 坏味基线 |
| `tdd` 看红 | `test-driven-development` | 亲眼看红、预期失败原因、立即通过=测已有行为 | **软化**:删"删码重来"铁律,加豁免白名单留痕 | 无豁免立场 |
| `debugging` 根因 | `systematic-debugging` | 无根因不修、查变更、模式对比、单变量假设、3 次失败=架构 | 与 skills 回路优先合并 | 四阶段形式、纠偏信号表 |
| 升级棘轮 | `brainstorming` | 只升不降 | 三路径→轻/重二分 | spike/bounded/architectural 仪式、段落式呈现、视觉伴侣 |
| 门结构 | `brainstorming` HARD-GATE | 批准门思想 | **反向偏离**:轻流程零门(仪式缩放,门也缩放) | "门永不缩放"原则 |
| 全局约束 | `writing-plans` | 逐字复制进计划头 | — | 每步完整代码、2-5 分钟粒度、Interfaces 签名块(为子代理设计) |
| 状态落盘 | SDD ledger | 信文档不信记忆、压缩后先读计划 | 台账→plan.md checkbox+哈希+开发记录 | 独立台账文件、恢复脚本 |

## 四、新造(两边都没有)

| 部件 | 新造原因 |
|---|---|
| 三门结构(设计/计划/最终)+每任务一 commit 组合 | 为"挂机自治+可回退"定制 |
| design.md + plan.md 成对同目录 | 恢复时读一对文件即重建上下文 |
| `/dev-resume` 独立恢复命令 | 命令启动形态下续命需要独立入口 |
| 无子代理降级程序(冷却自审,标注非独立) | pi 默认无子代理,不断链 |
| 命令壳(prompt templates → 技能) | pi 特有机制的两层结构 |

## 五、舍弃清单(按理由分组)

**① 场景不符(个人使用无此工况)**:`triage`(含 .out-of-scope 知识库、agent brief)、`wayfinder`、`dispatching-parallel-agents`、多上下文 CONTEXT-MAP。

**② 形态决策的直接代价**:
- 命令启动 → 宪法注入、session hook、压缩重注入(superpowers bootstrap 全家)
- 轻形态 → SDD 全套:控制器/实现者分离、任务简报脚本、四状态报告契约、五轮修复+熔断、模型分档、评审包脚本(**整体留档为大型任务升级档**)
- 混合模式 → 三路径仪式;HARD-GATE 的"门永不缩放"被反向偏离
- 个人集成习惯 → worktree 隔离、finishing 菜单
- 无团队规范 → Fowler 坏味基线(可日后写成仓库规范挂回)

**③ 低频/边缘工具,不在开发主循环**:`prototype`、`research`、`handoff`、`wizard`、`to-questionnaire`、`wait-what`、`teach`、`resolving-merge-conflicts`、`writing-skills`。需要时单独补装原版。

**④ 被合并吸收**:`ask-matt`→分类器;`grill-with-docs`(本体即 grilling+domain-modeling 的组合器)→ dev 阶段 1 内置组合,独立续做入口由 /dev-resume 的“仅设计”状态承接;`to-spec`/`to-tickets`→两份模板;`implement`→阶段 3 循环;`executing-plans`→轻形态本体;`writing-plans`→计划模板。

## 六、六个关键取舍(访谈定案,上表大部分行的推导依据)

1. **命令启动 vs 自动注入**:砍 bootstrap 全家;补偿是状态落盘使提醒多余
2. **轻形态 vs 流水线**:最大单笔舍弃(约一半 superpowers 工程量);换 1/2–1/4 token 成本与上下文连续性
3. **TDD 软化**:唯一刻意违背铁律项目之处;亲眼看红保灵魂,豁免留痕防滥用
4. **三门 vs 四门/零门**:门的位置跟返工成本走——设计错最贵,门 1 在那;执行错便宜,自治
5. **范围三分**:必装主干 / 中频(/dev-doc、/dev-review)/ 彻底舍弃——防"功能齐全但没人用"
6. **单文件状态**:台账、进度、评审记录合并进 plan.md;少一个文件少一处失同步

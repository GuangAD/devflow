# devflow — 个人开发工作流(pi 技能包)

由 mattpocock/skills 与 obra/superpowers 蒸馏而成的个人 AI 编码工作流。
设计定稿见 `../analysis/03-distilled-workflow-design.md`。

**一句话**:一个 `/dev` 命令走天下——内部 classifier 路由轻/重/巨流程(light/heavy/huge track),三道门(设计→计划→最终)守住方向、路径、结果,门之间 agent 挂机自治,一切状态落盘在 git 里的文档中;判为"巨"的需求先走 `/dev-map` 决策地图分批探路,fog 散尽后再回到 `/dev`。

## 结构

```
skills/                    # 技能:工作流逻辑
├── dev/                   # 主入口:classifier + 轻流程 + 重流程 + 回退协议
│   └── references/        #   设计模板(design)、规格模板(spec)、自查清单、计划模板、implementer 派发模板
├── dev-doc/               # 知识沉淀(CONTEXT.md + ADR)
├── dev-resume/            # 中断恢复协议
├── dev-review/            # 代码库巡检
├── dev-map/               # 巨型需求的决策地图:destination/fog/ticket/out of scope,产决策不产代码
│   └── references/        #   地图模板(map)
├── grilling/              # 纪律:访谈原语(design tree/round/frontier)
├── domain-docs/           # 纪律:词汇表 + ADR 维护
├── tdd/                   # 纪律:红绿循环 + waiver allowlist
├── code-review/           # 纪律:subagent 评审 + 分级处置
│   └── references/        #   评审派发模板 + 复审专用模板
├── debugging/             # 纪律:根因先行诊断
└── verification/          # 纪律:证据先于声称

prompts/                   # 命令:固定入口
├── dev.md                  # → /dev <任务描述>
├── dev-doc.md              # → /dev-doc [术语/决策]
├── dev-resume.md           # → /dev-resume [计划]
├── dev-review.md           # → /dev-review [范围]
└── dev-map.md              # → /dev-map <需求描述>

extensions/                # 扩展:devflow 唯一的非技能产物
└── context-meter.ts        #   注册 context_usage 工具:读上下文占比,只报数、不判阈值
```

## 安装

**首选:pi 包方式**(仓库根 package.json 已声明 pi 清单):

```bash
pi install git:github.com/GuangAD/devflow@v3.0.0   # 全局,锚定 ref
pi install -l git:github.com/GuangAD/devflow      # 项目级(.pi/settings.json)
pi -e git:github.com/GuangAD/devflow              # 试用不安装
```

升级:仓库打新 tag 后 `pi install git:github.com/GuangAD/devflow@<新ref>`;未锚定 ref 的安装可被 `pi update --extensions` 跟进。

**备选:settings.json 直接指向本目录**(本地开发本包时用,不经安装):

```json
{ "skills": ["D:/test/pi-workflow/devflow/skills"], "prompts": ["D:/test/pi-workflow/devflow/prompts"] }
```

手动复制 skills/prompts 到 `~/.pi/agent/` 的老方法已由 install.sh 承担,该脚本已废弃,保留仅为兼容。
重启 pi 后,输入 `/` 应能看到 `dev`、`dev-doc`、`dev-resume`、`dev-review`、`dev-map` 五个命令。

## 使用

### 日常开发

```
/dev 给项目加团队邀请功能        ← 重流程:访谈→设计+规格骨架(门 1)→用例详版+计划(门 2)→逐任务开发→最终确认(门 3)
/dev 修复导出时的报错           ← 轻流程:直接修(根因先行),汇报后提交
/dev 把单租户改造成多租户        ← 巨流程:/dev-map 建地图→逐 ticket 探路→fog 散尽后进 /dev 重流程
/dev-resume                     ← 中断后续命
```

### 重流程中你只需要在三个点出现

1. **门 1**:访谈结束后确认两份文档——design.md(决策快照)+ spec.md 骨架(接口规格四件套+pinned case+接口面穷举清单)
2. **门 2**:确认 spec.md 用例详版与开发计划(plan.md,任务=接口组)
3. **门 3**:验收最终报告

门之间的开发阶段 agent 自治:按依赖拓扑序**串行**逐任务——实现派给 subagent(优先)或会话内做(fallback)→ 验证 → subagent 评审 → 提交 → 勾选进度。任务边界默认不停顿,只有 Critical 问题、implementer 停手、或上下文真的挤到需要换会话时才会叫你。

### 巨流程:一次谈不完的需求先建地图

判巨时 `/dev` 会路由到 `/dev-map`。它**产决策不产代码**,用一张 `docs/maps/<日期>-<slug>/map.md` 分批探路:

```
destination(定死范围) → fog(还说不 sharp 的) → ticket(能说精确的) → 一次会话解一个 ticket → fog 散尽 → 回 /dev 重流程
```

fog 与 ticket 的分界判据是**你现在能不能把问题说精确**,而不是能不能回答它。地图走完后,design.md 从已定决策直接生成,访谈只补门 1 自查发现的具体空白。

它补的是重流程(heavy track)的一个结构性死角:门 1 要求"design tree 无含糊分支",而巨大需求的开放问题短期清不空——硬进重流程只会卡在门 1 前无限访谈。

### 知识与维护

```
/dev-doc                        ← 把会话里刚聊定的术语/决策落盘
/dev-review                     ← 定期巡检,产出架构深化候选
```

## 设计取舍速览

| 决策 | 选择 | 理由 |
|---|---|---|
| 触发方式 | 命令启动,无自动注入;扩展只注册一个按需调用的只读工具 | 个人使用,拒绝流程感重的自动接管;状态落盘使常驻注入不再必要,上下文占用虽落不了盘,但可在任务边界按需取一次。**不注入也顺带保住了 prompt cache 的前缀** |
| 执行引擎 | 会话内控制 + subagent 实现 + subagent 评审 | 评审独立性必须保住;实现派给 subagent 是为隔离工作记忆——状态虽已落盘,工作记忆没有。无 subagent 时退回会话内实现 + 按需切换 |
| TDD | 默认制 + waiver allowlist 留痕 | 亲眼看红是核心;纯配置/文案 waiver 防磨人 |
| 门密度 | 轻流程零门;重流程三门;巨流程先走地图层再进重流程 | 人在决策处出现,在执行处消失;巨流程把"决策"本身拆成多批 |
| 设计产物 | design.md 决策快照(冻结)+ spec.md 实现规格(演进,带变更记录) | 决策不再被开发漂移污染;接口真值有 ledger 可溯;已知缺陷类在设计期被自查清单拦截(v2,源自 threejs-labs 实证回顾) |
| 回退 | 文档阶段零成本;开发阶段按 commit 精确切除 | 每任务一提交使爆炸半径可计算 |

## 术语表

正文里的技术术语用英文,叙述用中文。下表是全部对应关系(含 devflow 自造词——自造词在正文中保留中文,英文仅供检索与外部对齐)。

**本表只做中英对照,不复述定义。** 术语在 devflow 领域内的含义与边界(含易混点)见根目录 [`../CONTEXT.md`](../CONTEXT.md);某个决策为什么不是另一种做法,见 [`../docs/adr/`](../docs/adr/)。

| 中文 | English | 备注 |
|---|---|---|
| 子代理 | subagent | |
| 接缝 | seam | 模块公共边界,测试只从这里观察行为 |
| 设计树 | design tree | 访谈时把未定决策建模成树 |
| 轮次 | round | 设计树按轮次推进 |
| 前沿 | frontier | 前置条件已落定、现在就能问的问题集 |
| 解锁集 | ready set | 硬依赖已完成的待做任务集 |
| 控制器 | controller | 指 dev 主流程所在的会话 |
| 实现者 | implementer | 承接实现任务的 subagent |
| 评审者 | reviewer | 承接评审的 subagent(pi-subagents 内置 `reviewer`) |
| 自审 | self-review | 无 subagent 时的降级评审 |
| 分类器 | classifier | 轻/重/巨三分路由 |
| 目的地 | destination | 地图的终点,定死范围 |
| 雾 | fog | 还说不精确、暂时开不成 ticket 的区域 |
| 票 | ticket | 地图上的一个决策单元 |
| 越界 | out of scope | 目的地之外,永不毕业 |
| 台账 | ledger | 状态记录,此处特指 plan.md 与 spec.md 变更记录 |
| 豁免 | waiver | TDD 豁免,须留痕 |
| 降级 | fallback | 无 subagent 时的替代路径 |
| 钉住用例 | pinned case | 钉住某个行为、防止复发的用例 |
| 曳光弹切片 | tracer-bullet slice | 纵向贯穿各层、可独立验收的任务切片 |
| 纵向切片 / 水平切片 | vertical slice / horizontal slice | |
| 反向验证 | mutation check | 手工定向变异测试:撤销修复确认用例转红 |
| 降思考档 | reduced reasoning tier | 复审派发时用 model 后缀指定 |
| 轻流程 / 重流程 / 巨流程 | light track / heavy track / huge track | devflow 自造词 |

## 维护说明

- 修改技能后无需重启 pi 以外的操作;技能在会话启动时重新扫描。
- `dev/SKILL.md` 与 `references/` 模板(设计/规格/自查/计划/**implementer 派发**)、`code-review/references/`(评审派发 + 复审模板)、`extensions/context-meter.ts` 是流程契约,改动需同步更新 `../analysis/03-distilled-workflow-design.md`。
- 扩展 `extensions/context-meter.ts`:**注册一个只读工具 `context_usage`,不挂任何事件钩子、不注入任何消息**——单一职责是报数,不含任何策略(阈值与处置写在 `dev/SKILL.md` 的「上下文预算」节)。**不注入是有意的**:注入要占用消息数组末位,而 pi 把 prompt cache 的 message 级断点放在「最后一条文本内容」上,常驻读数会夺走断点、令整段历史缓存失配;工具结果只在被调用时产生,不吃缓存。数值来自 pi 官方接口 `ctx.getContextUsage()`(与 TUI footer 同源):末条 assistant 的真实 `usage` 加尾随消息估算,`contextWindow` 取当前模型实际窗口;读数不可用时(如刚压缩完)如实说明而不猜。**零运行时依赖**——`parameters` 需要 TypeBox schema,而 TypeBox schema 即普通 JSON Schema,故写字面量 + `import type`(会被擦除);若改成 `import { Type } from "typebox"` 取值引用,扩展会因解析不到该包而加载失败(它只存在于 pi 自己的依赖树里)。
- 改动扩展后必须跑它的测试(本包唯一不能靠人工核对的产物):`node --experimental-strip-types devflow/extensions/context-meter.test.mjs`。
- 评审 subagent:直接用 pi-subagents 内置 `reviewer`,不做本地副本或覆盖,保持上游同步;复审 reduced reasoning tier 在派发时指定(model 后缀),不用本地 agent 覆盖。
- implementer subagent:优先用环境提供的通用 subagent/任务工具,不做本地副本。模板见 `skills/dev/references/implementer-prompt.md`;它**不提交、不改 plan/spec/design、不评审自己**,这三条是它在流程里的边界。
- 本仓库**自身**的领域词汇表在根目录 `CONTEXT.md`,架构决策记录在 `docs/adr/`。两者都由 `/dev-doc` 维护——这是 devflow 吃自己的狗粮:`domain-docs` 纪律的第一个适用对象就是它自己。改动流程契约后,若术语含义或决策理由有变,同步这两处(术语就地改,ADR 只可被取代、不可被修改)。
- 留档未实现(升级路径):SDD 的流水线全套(四状态报告契约、五轮修复+熔断、模型分档、评审包脚本;controller/implementer 分离已随 implementer subagent 部分落地)、triage、并行排查、per-repo setup。

# devflow — 个人开发工作流(pi 技能包)

由 mattpocock/skills 与 obra/superpowers 蒸馏而成的个人 AI 编码工作流。
设计定稿见 `../analysis/16-workflow-redesign.md`(2026-11-01 重设计);更早的 `analysis/03` 已被它取代。

**一句话**:一个 `/dev` 命令走天下——接到需求先看再判,能直接做就直接做;要设计就写需求文档(门 1),切完片、写完技术规格与全部任务契约再停一次(门 2),然后逐任务自治开发,最后门 3 验收。三道门守方向/路径/结果,门之间 agent 自治,一切状态落盘在 git 里的文档中。

## 结构

```
skills/                    # 技能:工作流逻辑
├── dev/                   # 主入口:入口分流 + 五阶段 + 三道门 + 回退协议
│   └── references/        #   intake(接到需求)、brief/slice/tech-spec/task-spec 四份模板、
│                          #   自查清单、implementer 派发模板
├── dev-doc/               # 知识沉淀(CONTEXT.md + ADR)
├── dev-resume/            # 中断恢复协议
├── dev-review/            # 代码库巡检
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
└── dev-review.md           # → /dev-review [范围]

extensions/                # 扩展:devflow 唯一的非技能产物
└── context-meter.ts        #   注册 context_usage 工具:读上下文占比,只报数、不判阈值

tests/
└── skill-check.sh          # 技能文档静态检查:字节上限、引用完整、无旧概念残留
```

## 安装

**首选:pi 包方式**(仓库根 package.json 已声明 pi 清单):

```bash
pi install git:github.com/GuangAD/devflow@v3.3.0   # 全局,锚定 ref
pi install -l git:github.com/GuangAD/devflow      # 项目级(.pi/settings.json)
pi -e git:github.com/GuangAD/devflow              # 试用不安装
```

升级:仓库打新 tag 后 `pi install git:github.com/GuangAD/devflow@<新ref>`;未锚定 ref 的安装可被 `pi update --extensions` 跟进。

**本地开发本包时**:`pi install -l <本仓库路径>`——本地包直接从解析路径加载,不复制,改完即生效(新会话)。

重启 pi 后,输入 `/` 应能看到 `dev`、`dev-doc`、`dev-resume`、`dev-review` 四个命令。

## 使用

### 日常开发

```
/dev 给项目加团队邀请功能        ← 有设计决策:阅读→提问→需求文档(门 1)→切片+规格+契约(门 2)→逐任务开发→验收(门 3)
/dev 修复导出时的报错           ← 有东西坏了:走根因先行,复现→定位→回归测试
/dev 把单租户改造成多租户        ← 说不清的大需求:先定终点→一次解一件→清晰后回到正常流程
/dev 把首页标题改成小站          ← 一句话且清楚:不写文档,直接做完汇报
/dev-resume                     ← 中断后续命
```

### 你会出现的三个点

1. **门 1**:确认需求文档 `brief.md`——目标 · 非目标 · 失败形态、选定方案、关键决策（你定的与我定的）、未定项
2. **门 2**:确认 `plan.md`(切几件、什么顺序)+ `spec.md`(数据结构/模块/覆盖标准/接缝清单)+ 全部任务契约。**三个文件此时已写好在磁盘上**,这段呈报只是索引
3. **门 3**:验收最终报告——逐项验收、评审记录、waiver 清单、提交列表、遗留事项、**我替你做过的判断**

门之间的开发阶段 agent 自治:按依赖拓扑序**串行**逐任务——实现派给 subagent(优先)或会话内做(fallback)→ 自己重跑验证 → subagent 评审 → 提交 → 勾选进度。任务边界默认不停顿,只有 Critical 问题、implementer 停手、或上下文真的挤到需要换会话时才会叫你。

**门必须真的停下**:2026-11-01 实测,只发通知不停顿,几十个工具调用会把通知淹没,agent 一路跑到门 3。

### 说不清的大需求

判据不是「活儿大」,而是**我能不能用两三句话复述出来**。复述不出来时:

```
先定终点(做到什么程度算告一段落) → 把能看清的列成单子 → 一次解一件 → 模糊处变清晰 → 回到正常流程
```

三条纪律:**只产决定,不产代码**;一次只解一件;看不清的别提前切碎。已定的事直接作为既有共识,不再重谈。

### 知识与维护

```
/dev-doc                        ← 把会话里刚聊定的术语/决策落盘
/dev-review                     ← 定期巡检,产出架构深化候选
```

## 设计取舍速览

| 决策 | 选择 | 理由 |
|---|---|---|
| 触发方式 | 命令启动,无自动注入;扩展只注册一个按需调用的只读工具 | 个人使用,拒绝过程感重的自动接管;状态落盘使常驻注入不再必要。**不注入也顺带保住了 prompt cache 的前缀** |
| 入口分流 | 先看再判:做事 / 修东西 / 复述不出来;最后才定产出多长 | 分类发生在理解之前等于猜。「直接做」是判断的结果,不是输入 |
| 执行引擎 | 会话内控制 + subagent 实现 + subagent 评审 | 评审独立性必须保住;实现派给 subagent 是为隔离工作记忆。无 subagent 时退回会话内实现 + 按需切换 |
| TDD | 默认制 + waiver allowlist 留痕 | 亲眼看红是核心;纯配置/文案 waiver 防磨人 |
| 门密度 | 三道:门 1 批需求、门 2 批切片与契约、门 3 验收 | 人在决策处出现,在执行处消失。门 2 曾被砍掉一次,2026-11-01 实测证明切片与契约是判断而非机械分解,已恢复 |
| 文档分层 | brief(冻结)/ plan(活)/ spec(活)/ 任务契约(一任务一份) | 按**批准层级**划分而非主题:谁批、批后谁能改,机械可判 |
| 契约精度 | 签名 + 调用形状;副作用与错误行为只在有状态/会失败时写 | 伪代码只表达数据怎么流,不表达逻辑——写到算法层,契约就成了代码的另一种写法,而它自己会过时 |
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
| 需求文档 | brief | 阶段 1 产出,门 1 批准后冻结 |
| 切片 | slice / plan | 阶段 2 产出,不含签名与用例 |
| 技术规格 | spec | 整体骨架,上限一页半 |
| 任务契约 | task spec | 一个任务一份:伪代码 + 步骤 + 用例 |
| 覆盖标准 | coverage standard | 分完整档与抽样档,每行要指到具体用例 |
| 大需求 | unclear request | 复述不出来的需求,先定终点再一次解一件 |
| 控制器 | controller | 指 dev 主流程所在的会话 |
| 实现者 | implementer | 承接实现任务的 subagent |
| 评审者 | reviewer | 承接评审的 subagent(pi-subagents 内置 `reviewer`) |
| 自审 | self-review | 无 subagent 时的降级评审,须标「非独立」 |
| 台账 | ledger | 状态记录,此处特指 plan.md 的开发记录 |
| 豁免 | waiver | TDD 豁免,须留痕 |
| 降级 | fallback | 无 subagent 时的替代路径 |
| 钉住用例 | pinned case | 钉住某个行为、防止复发的用例 |
| 曳光弹切片 | tracer-bullet slice | 纵向贯穿各层、可独立演示的任务切片 |
| 纵向切片 / 水平切片 | vertical slice / horizontal slice | |
| 反向验证 | mutation check | 手工定向变异测试:撤销修复确认用例转红 |
| 降思考档 | reduced reasoning tier | 复审派发时用 model 后缀指定 |

## 维护说明

- 修改技能后无需重启 pi 以外的操作;技能在会话启动时重新扫描。**改完跑一轮静态检查**:`bash devflow/tests/skill-check.sh`。
- 流程契约 = `dev/SKILL.md` + `dev/references/`(intake、四份模板、自查清单、implementer 派发)+ `code-review/references/`(评审派发 + 复审模板)+ `extensions/context-meter.ts`。改动需同步更新 `../analysis/16-workflow-redesign.md`。
- `dev/SKILL.md` 保持在 **20,000 字节以内**——上游实证:compaction 后每个技能只重挂前 20,000 字符,超出即永久丢失。超了就把细节搬进 `references/`,SKILL.md 只留骨架。`skill-check.sh` 会拦。
- 扩展 `extensions/context-meter.ts`:**注册一个只读工具 `context_usage`,不挂任何事件钩子、不注入任何消息**——单一职责是报数,不含任何策略。**不注入是有意的**:注入要占用消息数组末位,而 pi 把 prompt cache 的 message 级断点放在「最后一条文本内容」上,常驻读数会夺走断点、令整段历史缓存失配。数值来自 `ctx.getContextUsage()`(与 TUI footer 同源)。**零运行时依赖**——`parameters` 写字面量 + `import type`;若改成 `import { Type } from "typebox"` 取值引用,扩展会因解析不到该包而加载失败。
- 改动扩展后必须跑它的测试(本包唯一不能靠人工核对的产物):`node --experimental-strip-types devflow/extensions/context-meter.test.mjs`。
- 评审 subagent:直接用 pi-subagents 内置 `reviewer`,不做本地副本或覆盖,保持上游同步;复审 reduced reasoning tier 在派发时指定。
- implementer subagent:优先用环境提供的通用 subagent/任务工具,不做本地副本。它**不提交、不改四层文档、不评审自己、不派 subagent、发现契约缺口即停手报告**——这五条是它在流程里的边界。
- 本仓库**自身**的领域词汇表在根目录 `CONTEXT.md`,架构决策记录在 `docs/adr/`。两者都由 `/dev-doc` 维护。改动流程契约后,若术语含义或决策理由有变,同步这两处(术语就地改,ADR 只可被取代、不可被修改)。
- **受控复述点清单**(同一规则在多处复述是刻意的——每个角色在自己的读物里都需要它;**改其一必查其余**):
  - mutation check:`tdd/SKILL.md`(归属与做法,源头)/ `code-review/SKILL.md`(闭合条件)/ `dev/references/implementer-prompt.md`(执行纪律第 8 条 + 速查表)/ `dev/references/slice.md`(开发记录格式)/ `../analysis/16` 第七节
  - TDD waiver:`tdd/SKILL.md`(allowlist 与留痕,源头)/ `dev/references/slice.md`(预登记)/ `dev/SKILL.md`(阶段 4 步 2 与步 7)/ `../analysis/16` 第七节
  - 上下文预算与 45% 阈值:`dev/SKILL.md`「上下文预算」节(唯一真值)/ `../analysis/16`;`extensions/context-meter.ts` 只报数、不含判据(测试有结构性断言看守)。`../docs/adr/0003` 也引用了该数值但 ADR 不可修改——阈值若变更,用新 ADR 取代而非就地改
  - 门 2 的存在与呈报形态:`dev/SKILL.md` 阶段 3 / `dev/references/self-check.md`「门 2 呈报」/ ADR-0005

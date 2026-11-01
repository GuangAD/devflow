# pi-memory 技术调研

调研对象:`pi-memory`(npm 包 / pi 扩展),作者 jayzeng。本文基于 **npm 发布版 0.4.2** 与 **GitHub main 分支最新提交(2026-09-21)** 双份源码核对,官方 README 与源码冲突处以源码为准,并单独标注两者的行为差异。

---

## 一、结论先行

**它是什么**:一个单文件 TypeScript 的 pi 扩展(`index.ts`,0.4.2 为 2431 行,main 为 2490 行),用「纯 Markdown 文件 + 7 个工具 + 4 个生命周期钩子」给 pi 加上跨会话记忆。核心不是向量数据库,而是「文件即记忆 + 系统提示词注入 + 可选 qmd 检索」。

**值不值得用**:值得,但要接受它的三个前提。

1. 记忆写入靠模型自觉(工具调用)和退出摘要,没有独立的抽取流水线;
2. 没有项目级隔离,默认所有项目共用一个全局目录;
3. 检索增强(qmd)是一整套额外依赖,不装也能用,但那样只有注入没有检索。

**技术上最值得学的设计**:为了不打断本地推理引擎的 prefix cache,它把注入内容做成「会话内字节稳定的快照」,只在明确检查点重建。多数记忆扩展按轮重建,会在 llama.cpp / vLLM / MLX 上每轮重算整段对话,这个成本被它显式避开了。

**最需要注意的行为**:默认 `stable` 模式下,你写入长期记忆后,**本轮注入的提示词不会立刻变**;模型看得到的是工具调用历史,想拿权威最新状态得调 `memory_read` / `memory_search`。这不是 bug,是为缓存一致性做的取舍。

---

## 二、事实卡

| 项目 | 值 |
|---|---|
| npm 包名 | `pi-memory`(注意:同名/近似名包很多,见第十一节) |
| 最新发布版 | 0.4.2(2026-08-10 发版,npm registry 最后修改 2026-08-11) |
| 仓库 | https://github.com/jayzeng/pi-memory |
| 许可 | MIT |
| 依赖 | 0 个运行时 npm 依赖;2 个 peer 依赖(`@earendil-works/pi-ai`、`@earendil-works/pi-coding-agent` 均 `>=0.81.1`) |
| 运行环境 | Node >= 22.19.0(测试需 Bun) |
| 仓库活跃度 | 202 星 / 47 fork / 22 open issues;pushed_at 2026-09-21;创建于 2026-02-15 |
| 安装 | `pi install npm:pi-memory` |
| 发版方式 | tag 驱动,`v*` tag 触发 GitHub Actions 出 npm 包(含 provenance) |
| 官方页面 | https://pi.dev/packages/pi-memory |

**版本 vs 仓库差异(重要)**:npm 上最新是 0.4.2,但 GitHub main 在 0.4.2 之后又合了 5 个以上提交(最新一次是 `fix: refresh stable snapshot on forget and restore`,2026-09-21),尚未发版。所以「你现在装到的 0.4.2」和「仓库 README 描述的 main」在快照语义、环境变量上不一致。本文会逐项标出。

---

## 三、它解决什么问题

pi 的会话结束即失忆。pi-memory 提出的问题拆解是:

- **跨会话失效**:昨天的决策、偏好、踩过的坑不会带进新会话;
- **压缩即是断片**:上下文压缩把工具历史裁掉后,agent 不知道自己在干什么;
- **记忆越长越没用**:把所有记忆整段注入,超出预算就从中间截断,早期决策被静默丢掉。

对应三个设计原则(见 `design.md`):

1. **文件就是索引**。不做独立元数据存储、不做抽取流水线、不做同步,`git diff` 就是记忆变更审计;
2. **注入要有选择性**。上下文预算 16K 字符,按优先级裁剪;
3. **永远优雅降级**。所有 qmd 相关能力都有超时和回退,缺 qmd 时退化为纯文件读写。

设计文档引用 Letta 2025-08 的「Is a Filesystem All You Need?」(LoCoMo 基准:文件系统 + 检索工具 74.0%,Mem0 图记忆 68.5%)作为动机,但作者自己明确写了 caveat:这只是「一个基准、两个系统、一种任务」,不能当证明。在核心设计取向上,风险整体是有自觉标注的。

---

## 四、运行时架构

### 4.1 五个生命周期钩子

| 钩子 | 触发时机 | 干了什么 |
|---|---|---|
| `session_start` | 会话开始 | 探测 qmd(`qmd collection list`);缺 collection 自动创建(`qmd collection add` + 两条 `qmd context add`);触发一次增量 `qmd embed` 补做上个会话的写入;建快照。缺 qmd 时用 `ctx.ui.notify` 打印安装指引 |
| `before_agent_start` | 每轮对话前 | 把记忆块拼进 system prompt(按 `PI_MEMORY_SNAPSHOT` 决定读快照还是重建) |
| `session_before_compact` | 上下文压缩前 | 写 `## Session Handoff` 到当天日志(未完成 scratchpad 项 + 当天日志最后 15 行),随后强制重建快照 |
| `input` | 用户提交输入 | 只做一件事:识别 `/quit`,记为退出摘要原因 |
| `session_shutdown` | 会话结束 | 生成「退出摘要」写入当天日志并落 qmd 索引;清理定时器 |

另外它在有 UI 时挂 `ctx.ui.onTerminalInput`,用于区分 `Ctrl+D` 退出(仅在空闲、编辑器为空时才认)。**没有注册任何斜杠命令**,所有操作走工具或环境变量。

### 4.2 注入内容与预算

注入发生在 `before_agent_start`,方式是 `systemPrompt = event.systemPrompt + 记忆块`,块头固定为 `## Memory` 加若干指引行(告诉模型各文件用途、`#tags`/`[[links]]` 约定、"用户说记住就立刻写")。

各段上限(源码常量,`index.ts` 第 148-159 行):

| 优先级 | 段 | 上限 | 截断方式 |
|---|---|---|---|
| 1 | 未完成的 scratchpad 条目 | 2000 字符 / 120 行 | 从头保留 |
| 2 | 当天日志 | 3000 字符 / 120 行 | 保尾部 |
| 3 | qmd 检索结果(仅 `per-turn` 模式) | 2500 字符 / 80 行 | 从头保留 |
| 4 | `MEMORY.md` | 4000 字符 / 150 行 | **中间截断**(保头保尾) |
| 5 | 昨天日志 | 3000 字符 / 120 行 | 保尾部 |
| 总计 | 全部 | 16000 字符 | 超限后整体从头截断,并附 `[truncated overall context: ...]` 提示 |

拼接顺序就是上表顺序,段之间用 `---` 分隔,整体包在 `# Memory` 标题下。注意 `MEMORY.md` 的两条现实含义:

- 它只保留 4K 字符,超出部分即使写了也不会被自动注入(检索仍能找到);
- 中间截断意味着「中间段的记忆静默消失」,这是作者在 `design.md` 里自己列为 open question 的取舍。

### 4.3 快照模式(KV cache 稳定性) -- 这是最容易被误解的部分

本地前缀缓存(llama.cpp / vLLM / MLX)从「第一个不同的 token」开始失效。如果注入块每轮都变,后面整段对话历史每轮都要重算。所以它把注入内容做成快照。

**0.4.2(你现在装到的版本)**:

```
PI_MEMORY_SNAPSHOT=stable   默认。快照在下列情况置脏,下一轮重建:
                            - session_start
                            - session_before_compact
                            - memory_write(target=long_term)
                            - memory_forget / memory_restore
                            - 跨天(快照记录的日期 != 今天)
PI_MEMORY_SNAPSHOT=per-turn 每轮重建,并额外注入按用户 prompt 检索出的 3 条结果
```

**main(未发版)**:语义收紧成"stable 就真的稳定"

```
stable  只在 session_start 建一次;长期记忆写入和跨天都不重建;forget/restore 立即重建
        (隐私优先:删掉的内容必须马上从提示词里消失)
refresh 恢复 0.4.2 的检查点行为,并附带 `Snapshot <reason> at <hh:mm:ss>` 说明行
per-turn 同 0.4.2
```

两种模式下共有的一点:`memory_write(target=daily)` 和 `scratchpad` 写入**不**触发重建 -- 因为它们高频,且写入内容已经出现在工具调用记录里,模型想看权威状态可以自己 `memory_read`。

**实践含义**:如果你在 `stable` 模式下说「记住我用 pnpm」,本轮 system prompt 里没有这一条(模型靠工具调用历史知道);下一轮才有(0.4.2)/要等新会话才有(main)。要让模型以文件为准,提示它 `memory_read`。

### 4.4 压缩前 handoff

`session_before_compact` 触发时写:

```markdown
<!-- HANDOFF 2026-02-15 14:30:00 [a1b2c3d4] -->
## Session Handoff
**Open scratchpad items:**
- [ ] Fix auth bug
**Recent daily log context:**
...当天日志最后 15 行...
```

没有未完成条目且当天日志为空时不写(避免噪音条目);无论是否写入,都会重建快照 -- 因为压缩会丢工具历史,快照必须跟上磁盘状态。

### 4.5 退出摘要(默认开启,这是它的隐藏成本)

`session_shutdown` 时用**当前会话模型**发一次 LLM 请求,把整段对话压成四个小节写进当天日志:

```markdown
<!-- 2026-02-15 18:02:11 [a1b2c3d4] -->
## Session Summary (auto, exit: /quit)

### Decisions
- ...
### Lessons Learned
- ...
### Notes
- ...
### Follow-ups
- ...
```

所有门禁条件(源码逐一核对):

| 条件 | 行为 |
|---|---|
| 退出原因是 `reload` / `new` / `resume` / `fork` | 跳过(除非 `PI_MEMORY_SUMMARIZE_TRANSITIONS=1`),避免这些切换变慢 |
| 会话消息数 < 4 | 跳过,不给一次性 `ls` 这种会话留噪音 |
| 无可用模型 / 无 API key / 空回复 | 不落盘(旧版本会写一段全是 `None.` 的样板,已修) |
| 摘要每个小节都是 `None.` | 视为空,不落盘 |
| 生成超过 `PI_MEMORY_EXIT_SUMMARY_TIMEOUT_MS`(默认 10000) | 放弃,不落盘。原因是 pi 核心等待 shutdown handler 没有超时,provider 卡住会卡死退出 |
| 生成成功 | 追加当天日志,然后**同步**跑一次 `qmd update`(30s 超时) |

代价与开关:`PI_MEMORY_EXIT_SUMMARY=0` 可完全关闭 —— 关闭后退出不做 LLM 调用、不跑 `qmd update`,退出是瞬时的。`PI_MEMORY_EXIT_SUMMARY_MODEL=provider/model-id` 可以把摘要路由到便宜模型(解析失败回退会话模型并警告)。main 新增 `PI_MEMORY_EXIT_SUMMARY_REASONING_EFFORT`(默认 `low`,`off` 表示不传该参数),起因是某些 provider(如 Baseten 的 GLM-5.2)只接受特定 reasoning effort,传 `low` 会 400,摘要静默失败。

### 4.6 qmd 集成细节

qmd 是 tobi/qmd 的全文 + 向量检索 CLI。pi-memory 对它的封装有几点值得单独记:

**探测与缓存**

- `detectQmd()` 执行 `qmd collection list`(15s 超时),**不用** `qmd status` -- 后者会做模型/设备探测(如 Vulkan 回退),容易超时误判;
- 结果缓存:正结果 5 分钟,负结果 5 秒(装完 qmd 不必等 5 分钟);
- `checkCollection()` 走 `qmd collection list --json`,同样 5 分钟 / 5 秒缓存。

**三种检索模式的真实命令**

| `memory_search` mode | qmd 子命令 | 说明 |
|---|---|---|
| `keyword`(默认) | `qmd search` | BM25 全文 |
| `semantic` | `qmd vsearch` | 向量检索,需 embeddings |
| `deep` | `qmd query` | 混合 + 重排 |

命令形态统一为 `qmd <sub> --json -c pi-memory -n <limit> <query>`,limit 会被夹到 1-25(默认 5)。超时默认 60s(`PI_MEMORY_QMD_SEARCH_TIMEOUT_MS`)。

**索引维护**

- 写入后 500ms 去抖触发一次 `qmd update`(30s 超时),完成后链式 `qmd embed`;
- `qmd embed` 是增量的,自带队列:进行中再请求会标 pending,结束后立即补跑一轮;
- 首次 embed 要下载嵌入模型,所以 semantic/deep 首次可能几分钟才可用;
- `PI_MEMORY_QMD_UPDATE=manual|off` 可关掉自动维护(此时 embedding 也不再自动跑)。

**Windows 专项处理**

npm 在 Windows 上生成的 `qmd.cmd` / `qmd.ps1` shim 把 shebang 解释器写成字面量 `/bin/sh`,在 git-bash/cygwin 之外必然失败。扩展的做法是在 `PATH` 的每个目录下探测 `node_modules/@tobilu/qmd/dist/cli/qmd.js`,找到就用 `node <qmd.js> ...` 直接调用,绕过 shim;同时注入 `NO_COLOR=1` 并删除 `FORCE_COLOR`,因为 qmd 即使带 `--json` 也可能输出 spinner/彩色进度条(代码里还写了 ANSI 剥离逻辑,专门清理这些杂质才能解析 JSON)。

---

## 五、七个工具详解

工具集分两层:**6 个核心工具**(无 qmd 也能用)+ **1 个检索工具**(需 qmd)。

### 5.1 `memory_write`

| 参数 | 值 | 说明 |
|---|---|---|
| `target` | `long_term` / `daily` | 写 `MEMORY.md` 或 `daily/<YYYY-MM-DD>.md` |
| `content` | Markdown | 正文 |
| `mode` | `append`(默认)/ `overwrite` | 仅对 `long_term` 有效;`daily` 永远追加 |

写入格式:自动加时间戳与 8 位会话 ID 注释,`long_term` 追加为

```markdown
<!-- 2026-02-15 14:30:00 [a1b2c3d4] -->
#decision [[database-choice]] 后端统一用 PostgreSQL,评估过 MySQL 与 MongoDB。
```

`overwrite` 会用 `<!-- last updated: ... -->` 头整体替换文件内容(危险操作,慎用)。

返回内容不贴全文,而是「追加成功 + 已有内容预览」,预览上限 4000 字符 / 120 行(`daily` 保尾,`long_term` 中间截断),并附带 `qmdUpdateMode` 等 details。

### 5.2 `memory_read`

| `target` | 说明 |
|---|---|
| `long_term` | 读 `MEMORY.md` |
| `scratchpad` | 读 `SCRATCHPAD.md` |
| `daily` | 读指定日期(默认今天),日期必须 `YYYY-MM-DD` 且真实存在,否则返回错误 |
| `list` | 列出所有日志文件名,倒序(最新在前) |

`daily` / `scratchpad` / `long_term` 返回**完整文件内容**,不做预览截断 -- 这是绕过快照拿权威状态的正规途径。

### 5.3 `scratchpad`

| `action` | 说明 |
|---|---|
| `add` | 追加 `- [ ] text`,带时间戳注释 |
| `done` | 按**子串匹配**(不区分大小写)把第一条未完成项勾成 `[x]` |
| `undo` | 反向操作,把第一条已完成项改回 `[ ]` |
| `clear_done` | 删除所有已完成项,并连带删除它们头顶的时间戳注释 |
| `list` | 只读展示 |

0.4.0 起改为**逐行就地修改**,不再走「解析 → 重建」,所以手写的标题、备注、子项目符号不会被首次写入抹掉(旧版本会)。匹配只命中第一条,同名前缀多条时要注意措辞。未完成项会进注入上下文(优先级最高),这也是它的实际用途:轻量任务队列,而不是待办事项管理。

### 5.4 `memory_search`

| 参数 | 默认 | 说明 |
|---|---|---|
| `query` | 必填 | 检索词 |
| `mode` | `keyword` | `keyword` / `semantic` / `deep` |
| `limit` | 5 | 夹到 1-25 |

行为要点:

- 缺 qmd 时**当场重探一次**(支持会话中途安装),仍缺则返回安装指引(带 `isError`);
- collection 缺失时会自动补建,再失败报错;
- 结果里若出现 `need embeddings`,自动触发后台增量 embed,并提示「稍后重试」,而不是让用户手敲命令;
- 输出格式:`### Result N` + `**File:** ...` + `**Score:** ...` + 片段,用 `---` 分隔;
- 首次 semantic/deep 超时会附带「首次可能下载模型」的提示。

### 5.5 `memory_forget`(删除是一等操作)

| 参数 | 说明 |
|---|---|
| `match` | 不区分大小写的子串,匹配「条目」而非行 |
| `target` | `long_term`(默认)/ `daily` |
| `date` | `target=daily` 时的日期,默认今天 |

**条目边界语义**(`forgetBlocks`):以 pi-memory 自己写的时间戳注释为条目起点,到下一个时间戳注释为终点,所以一段多段落的写入会被整体删除;首个时间戳注释之前的内容按空行分段删除。同时兼容 CRLF 与 UTF-8 BOM。

删除前先把完整内容写进 `recovery/<uuid>.json`(`flag: wx`,不覆盖已有记录),再把可见的 recovery ID 返回给模型;文案明确写着「想撤销就调 `memory_restore`」。删除后立即重建快照(隐私语义:删掉的必须马上从提示词里消失)。

### 5.6 `memory_restore`

只接 `recoveryId`。语义是**幂等 + 只补缺失**:把记录里的条目与目标文件现有内容比对,只追加不存在的条目,所以「删除后又有新写入」的情况下不会覆盖新内容;恢复完成后在记录里写 `restoredAt`,再次调用返回「已恢复」。ID 走严格 v4 UUID 正则校验,不做路径拼接,避免越权读写。

### 5.7 `memory_status`(排障首选)

一次性报告:记忆目录、`MEMORY.md` 字符数、scratchpad 未完成/总数、日志数量与最新日期、qmd 是否可用、`pi-memory` collection 是否存在、embeddings 状态(`ready` / `missing` / `unknown` / `n/a`)、以及当前生效的配置项。

embeddings 探测的做法是跑一次 `qmd vsearch memory -n 1` 看 stderr 有没有 `need embeddings`,超时默认 15s;`unknown` 表示探测超时(索引正忙时常见),会提示可调 `PI_MEMORY_EMBED_PROBE_TIMEOUT_MS`(main 新增)。

---

## 六、磁盘格式

```
~/.pi/agent/memory/          # 可用 PI_MEMORY_DIR 覆盖
  MEMORY.md                  # 长期记忆,人工可读可改
  SCRATCHPAD.md              # 清单
  daily/
    2026-02-15.md            # 当天日志,只追加
    2026-02-14.md
  recovery/
    6f1a...-....json         # memory_forget 的完整恢复载荷
```

**`MEMORY.md` / 日志条目**:时间戳注释 + 正文,条目之间空行分隔。注释的正则(源码 `MEMORY_ENTRY_META_COMMENT_REGEX`)接受三种形态:

```
<!-- 2026-02-15 10:12:03 [a1b2c3d4] -->
<!-- last updated: 2026-02-15 10:12:03 [a1b2c3d4] -->
<!-- HANDOFF 2026-02-15 14:30:00 [a1b2c3d4] -->
```

也就是说,**你手写的条目如果不带这种注释,`memory_forget` 会退化成按空行段落删除**,粒度会变粗。想要精准删除,保留注释头。

**`SCRATCHPAD.md`**:

```markdown
# Scratchpad

<!-- 2026-02-15 09:12:00 [a1b2c3d4] -->
- [ ] 修 auth bug
<!-- 2026-02-15 09:40:00 [a1b2c3d4] -->
- [x] 看 PR #42
```

**`recovery/<id>.json`**:

```json
{
  "version": 1,
  "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
  "createdAt": "2026-02-15T06:12:03.000Z",
  "target": "long_term",
  "date": "2026-02-15",
  "removedContent": ["<!-- ... -->\n#preference ..."],
  "restoredAt": "2026-02-15T07:00:00.000Z"
}
```

读取时会做结构校验(`version === 1`、ID 与正则一致、`target` 合法、`daily` 必带合法 `date`、`removedContent` 非空字符串数组),校验不过视为无记录。recovery 文件不是 `.md`,不在 qmd 索引范围内。

**日期口径**:全部按**本地日历日**(0.4.0 修复),不是 UTC。此前 UTC 实现会让傍晚(如 PDT 17:00 之后)写入落到「明天」的文件里,注入时看错文件。

---

## 七、配置项

### 7.1 0.4.2 实际支持的 9 个

| 变量 | 取值 | 默认 | 作用 |
|---|---|---|---|
| `PI_MEMORY_DIR` | 路径 | `~/.pi/agent/memory` | 记忆根目录 |
| `PI_MEMORY_SNAPSHOT` | `stable` / `per-turn` | `stable` | 快照策略 |
| `PI_MEMORY_QMD_UPDATE` | `background` / `manual` / `off` | `background` | 是否自动 `qmd update` + `qmd embed` |
| `PI_MEMORY_QMD_SEARCH_TIMEOUT_MS` | 正整数 | `60000` | 显式 `memory_search` 的超时 |
| `PI_MEMORY_NO_SEARCH` | `1` | 未设 | 仅 `per-turn` 模式生效:关掉每轮自动检索注入 |
| `PI_MEMORY_SUMMARIZE_TRANSITIONS` | `1`/`true`/`yes`/`on` | 未设 | 让 `/reload`、`/new`、`/resume`、`/fork` 也写退出摘要 |
| `PI_MEMORY_EXIT_SUMMARY` | `0`/`off`/`false`/`no` | 开启 | 关闭退出摘要 |
| `PI_MEMORY_EXIT_SUMMARY_MODEL` | `provider/model-id` | 会话模型 | 摘要专用模型 |
| `PI_MEMORY_EXIT_SUMMARY_TIMEOUT_MS` | 正整数 | `10000` | 摘要生成超时 |

### 7.2 main 新增(未发版)

| 变量 | 取值 | 默认 | 作用 |
|---|---|---|---|
| `PI_MEMORY_SNAPSHOT=refresh` | 新增枚举值 | -- | 恢复检查点刷新 + `Snapshot <reason> at <time>` 说明行 |
| `PI_MEMORY_EMBED_PROBE_TIMEOUT_MS` | 正整数 | `15000` | `memory_status` 的 embeddings 探测超时 |
| `PI_MEMORY_EXIT_SUMMARY_REASONING_EFFORT` | 字符串 / `off` | `low` | 摘要调用的 reasoning effort |

这些都是进程环境变量,**pi 内没有设置界面**,要在启动 pi 前的 shell 里 export(或在项目脚本里传)。

---

## 八、安装与快速验证

```bash
# 1. 安装扩展
pi install npm:pi-memory

# 2. 可选:装 qmd(检索能力)
npm install -g @tobilu/qmd

# 3. 跑一次,让模型写记忆
pi -p "记住:这个仓库一律用 pnpm,不要用 npm"

# 4. 看落盘结果
cat ~/.pi/agent/memory/MEMORY.md
cat ~/.pi/agent/memory/SCRATCHPAD.md
```

会话内排障顺序:

1. 让 agent 调 `memory_status`,一次看完 qmd / collection / embeddings / 配置;
2. 检索不到 → 确认 `qmd update` 是否被 `PI_MEMORY_QMD_UPDATE=off` 关掉;
3. `memory_search` 说缺 qmd → 检查 `PATH`;Windows 上还要确认 npm 全局 `node_modules` 目录在 `PATH` 里(扩展靠它定位 `qmd.js`);
4. 「刚写完但没注入」→ 正常,`stable` 快照的语义,用 `memory_read` 或切 `refresh`(main)/ `per-turn`。

手工建 collection(自动建失败时):

```bash
qmd collection add ~/.pi/agent/memory --name pi-memory
qmd context add /daily "Daily append-only work logs organized by date" -c pi-memory
qmd context add / "Curated long-term memory: decisions, preferences, facts, lessons" -c pi-memory
qmd embed
```

---

## 九、实战用法建议

### 9.1 写什么、不写什么

**适合写进 `MEMORY.md`**:稳定偏好(包管理器、编辑器、代码风格)、已落地且难逆转的架构决策(含理由与被否方案)、反复踩的坑的结论、跨项目的个人习惯。一条一个条目,带上 `#decision` / `#preference` / `#lesson` / `#bug` 和 `[[主题]]` 链接。

**适合写进当天日志**:过程性记录、试验与失败、临时上下文。日志本来就是每日追加、隔天只在「昨天」窗口出现一次,适合做时间线。

**不要写**:可从仓库读到的信息(文件清单、依赖版本、代码结构 -- 让 agent 自己读,记忆里存快照必然过期)、密钥与 token(它不做任何脱敏,恢复记录也会把原文存进 `recovery/`)、大段不可信外部文本(见 10.2)。

### 9.2 记忆卫生

- `MEMORY.md` 是「策展」文件,不是流水账。它只有 4K 注入预算,超过就被截断;条目应短、可判决、可删除;
- 被纠正的事实**必须**用 `memory_forget` 清掉,而不是再写一条相反的 -- 否则检索会同时命中两条互相矛盾的记录,这正是它文档里说的「自信地给出错误答案」;
- 定期 `memory_read(target=list)` 看日志总量,`daily/` 会长期增长(每天一个文件,含自动摘要);
- `recovery/` 目前**没有自动清理**(源码里没有 TTL 或清理逻辑),长期使用需要自己按需删旧 JSON,这是它当前的明确缺口。

### 9.3 多项目场景的处理

默认所有项目共用 `~/.pi/agent/memory/`。后果是 A 项目的 `#decision` 会在 B 项目被检索命中。可选做法:

1. 接受共享,只写「跨项目也不冲突」的内容(个人偏好、通用经验),项目级结论写进各仓库的 `AGENTS.md`(本来就会被 pi 自动加载);
2. 按项目切目录:启动 pi 时设 `PI_MEMORY_DIR=~/.pi/agent/memory/<project>`,代价是每个项目要重建 collection 与 embeddings,且切换靠外部脚本;
3. 换用有 global / project 双作用域的同类实现(见第十一节)。

### 9.4 成本控制

- 退出摘要默认开,每次真实退出会发一次 LLM 请求(整段对话,最多截到 80K 字符)。长会话频繁开关 pi 时,用 `PI_MEMORY_EXIT_SUMMARY_MODEL` 指到便宜模型更实际;
- 只用文件不检索时,把 `PI_MEMORY_QMD_UPDATE=off` 可以完全避免后台 `qmd update` / `embed` 的 CPU 占用(前提是你也不需要 semantic/deep);
- 想彻底避开每轮检索延迟:`stable`(默认)本身就是这个选择。

---

## 十、风险与限制(按影响排序)

### 10.1 全局单库,无项目隔离 -- 影响最大

目录固定、只有一个 collection、没有 project scope。跨项目污染是结构性的,不是配置问题。对比 `@josephakern/pi-memory` 明确做了 `~/.pi/agent/memory`(global)+ `<repo>/.pi/memory`(project,可提交)双作用域。

### 10.2 注入内容是 system prompt 的一部分 -- 提示注入面

`MEMORY.md`、日志、检索结果都会被拼进 system prompt。任何被写进记忆的不可信文本(网页摘录、issue 正文、别人的代码注释)都会在之后每个会话里以**系统级**权威身份出现。工程上的约束是:记忆只写「你判断过的结论」,不写「原样抄来的外部内容」。这一条它文档里没有强调,但对 agent 安全边界很关键。

### 10.3 `stable` 快照的信息滞后

0.4.2 在长期记忆写入后要把滞后推到下一轮,main 推到下一个会话。带来的实际风险是:模型在同一个会话内继续按旧记忆行动,而用户以为「已经记住了」。缓解:提示词里已引导模型用 `memory_read`;或在 main 上保持默认,靠 forget/restore 的立即刷新覆盖安全敏感的删除。

### 10.4 `MEMORY.md` 的 4K / 中间截断

超过 150 行或 4000 字符后,中间部分静默不被注入。日志型记忆适合它,沉淀型知识库不适合 -- 这类内容更适合放 `AGENTS.md` 或项目文档(pi 原生加载),而不是记忆文件。

### 10.5 qmd 是一整套额外运行时

需要 Node、需要下载嵌入模型、需要磁盘、semantic 首次要等;`deep` 模式官方标注约 10 秒。它属于「有收益但有明显边际成本」的可选层。Windows 上的 shim 问题是真实存在且已被专门绕过的,说明踩坑面不小。

### 10.6 依赖模型自觉,没有抽取流水线

写记忆全靠模型判断 + 工具调用,补漏靠退出摘要。没有「从会话里自动抽取候选事实让人确认」的环节。比起 `@samfp/pi-memory` 那类「从纠正中学习」的实现,它对模型质量更敏感。

### 10.7 其他小问题

- 没有脱敏:密钥一旦写进记忆,会同时进索引和 `recovery/`;
- 退出摘要在关闭时是同步等一次 `qmd update`(30s 超时),不是真正的瞬时退出;
- 未测项:BM25 对中文分词的召回质量尚未验证(待确认);`deep` 模式的实际延迟取决于本机模型(待确认)。

---

## 十一、同名包辨析(装错的风险)

`pi.dev` 上叫 `pi-memory` 或近似名的包至少有一打,能力模型差异很大。几个容易混的:

| 包 | 定位差异 |
|---|---|
| `pi-memory`(本文,jayzeng) | 文件 + qmd 检索 + 快照注入,7 工具,下载量最高(~57K/月) |
| `@samfp/pi-memory` | 从会话中**自动学习**纠正、偏好、模式,自动注入 |
| `@josephakern/pi-memory` | global + in-repo project 双作用域,带 topic 文件 |
| `@chendpoc/pi-memory` | JSONL sidecar 检索 + preflight 注入 + **密钥脱敏** |
| `@amaster.ai/pi-memory` | `MEMORY.md` + `USER.md` 冻结快照 |
| `@shog-lab/pi-memory` | 向量 + FTS5 + 知识图谱混合检索 |
| `SiliconState/Pi-Memory` | 原生 C CLI + `MEMORY.md` 桥接,另一条技术路线 |
| `pi-agent-memory` | 基于 claude-mem,AGPL-3.0 |

选型建议:要「可读可 diff 的纯文件 + 检索」选本文这个;要项目级隔离看 `@josephakern`;要自动学习看 `@samfp`;要脱敏看 `@chendpoc`。

---

## 十二、测试与二次开发

```bash
npm test            # 197 个单元测试,需 Bun,不带 LLM / qmd,秒级
npm run test:e2e    # 11 个端到端场景,需 pi + API key
npm run test:eval   # 召回率 A/B 评测,需 pi + API key + qmd
PI_E2E_PROVIDER=openai PI_E2E_MODEL=gpt-4o-mini npm run test:eval
EVAL_RUNS=3 npm run test:eval
```

所有测试都会备份并还原现有记忆文件。评测设计是 25 条记忆 / 15 个问题 / 30 天模拟历史,对比「开/关选择性注入」的召回差异;`design.md` 明确写了这组数字**尚未在装有 qmd 的机器上实测**,所以引用其 +33% 的说法时要当作假设,不是结论。

二次开发:单文件、无构建步骤,pi 直接加载 TypeScript。

```bash
pi -p -e ./index.ts "remember: I prefer dark mode"
```

`postinstall` 脚本只做一件事:判断是否在源码仓库(非 `node_modules`、存在 `.githooks`)时设置 `core.hooksPath`。作为依赖安装时不做任何副作用 -- 这点是干净的。

想把默认值改成你的习惯,最稳的做法是包一层本地 fork 或在自己的 shell 配置里 export 变量,而不是改 `node_modules`(升级会丢)。

---

## 十三、总体判断

**推荐用的场景**:单人、多项目但不强求记忆隔离、在意「记忆可见可改、能进 git」、本地跑推理引擎(它的快照设计能省下实打实的重算)、偶尔需要跨日志语义检索。

**不推荐或需要改造的场景**:

- 团队多人共享记忆(纯本地文件,无同步、无并发写保护,写同一个 `MEMORY.md` 会互相覆盖);
- 需要项目级隔离(要自己套 `PI_MEMORY_DIR`);
- 需要记忆里存敏感信息(无脱敏、无加密);
- 期待「自动学会你的偏好」(它的写入是被动的)。

**它的真实价值不在检索**。BM25 检索、embedding、rerank 这些是现成能力(qmd)。真正原创的是三点:把记忆做成人类可读可 diff 的文件、用条目级 recovery 让删除可撤销、为本地前缀缓存做字节稳定注入。这三点值得借鉴到任何自建记忆层里。

---

## 参考来源

1. 官方包页面:https://pi.dev/packages/pi-memory
2. 源码仓库:https://github.com/jayzeng/pi-memory(commit `1e276a7`,2026-09-20;调研时 `pushed_at` 2026-09-21)
3. npm 注册表元数据:https://registry.npmjs.org/pi-memory(latest 0.4.2,peer 依赖 `@earendil-works/pi-* >=0.81.1`)
4. 发布版源码核对:`pi-memory-0.4.2.tgz` 内 `index.ts`(2431 行)、`README.md`、`CHANGELOG.md`
5. main 分支本地核对:`index.ts`(2490 行)、`design.md`、`test/*.ts`、`.github/workflows/*`
6. 设计引用:Letta《Benchmarking AI Agent Memory: Is a Filesystem All You Need?》(2025-08,LoCoMo)
7. qmd:https://github.com/tobi/qmd
8. 同类实现对照:`@samfp/pi-memory`、`@josephakern/pi-memory`、`@chendpoc/pi-memory`、`@amaster.ai/pi-memory`、`@shog-lab/pi-memory`、`pi-agent-memory` 的 pi.dev 包页面

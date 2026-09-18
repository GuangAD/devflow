---
name: code-review
description: 任务级代码评审纪律:派 subagent(子代理)独立评审 diff,双裁决(规格符合+代码质量),发现分级处置。用于 dev 重流程(heavy track)阶段 3 每任务完成后,以及门 3 前的整特性终审。
---

# code-review — 评审纪律

核心原则:**implementer 不得 self-review 放行**。每个任务完成后,由一个独立上下文的 reviewer 对照任务要求与代码现实给出裁决。

## 派发(环境有 subagent/任务工具时)

按 [references/reviewer-prompt.md](references/reviewer-prompt.md) 模板派发评审 subagent,提供:

- 任务简报:plan.md 中该任务的完整文本(端到端行为、接口组、验收标准、编码方向)
- 接口规格:spec.md 中该任务接口组的条目、用例表与覆盖声明(评审对照:测试是否钉住所列行为、矩阵行/铁律/枚举是否兑现,计划外导出是否登记变更记录)
- 设计约束:design.md 中与该任务相关的全局约束(逐字复制)
- 差异文件:任务改动写入 `.review/<任务号>.patch`(项目内相对路径,使用方仓库 `.gitignore` 应含 `.review/`),连同 `git log --oneline` 一起交给 reviewer——**diff 走文件,不灌进对话上下文**;提交前取 `git diff HEAD`,已提交取 `git diff <BASE>..<HEAD>`,禁止 `/tmp` 等跨环境路径
- implementer 报告:测试结果(数字必须附来源)、关键决定、已由自动化测试锁定的性质清单(测试文件:用例名)

**评审能力矩阵**(按实际环境对号入座,行为可预测):

| 环境 | reviewer 行为 | controller 前置义务 |
|---|---|---|
| 有 subagent(内置 reviewer,无 shell) | 读差异文件与指定文件;验证需求写入报告由 controller 代跑,报告不得出现悬置验证清单 | 差异文件放项目内相对路径;派发前跑完测试并附输出 |
| 无 subagent | fallback self-review(下节) | 报告显著标注「self-review,非独立评审」 |

评审可异步发起以省等待,但**处置发现(是否存在 Critical)前不得提交下一任务**。

**差异文件生命周期**:diff 只服务本轮评审。该任务提交(含修复复审通过后的提交)后,controller 即删除本任务的 `.review/` diff 文件——git 历史已含全部改动;门 3 收尾时清空整个 `.review/` 目录。

## fallback self-review(环境无 subagent 能力时)

无独立 reviewer 时,执行**冷却 self-review**,并在报告中显著标注"self-review,非独立评审":

1. 换一种读法重看完整 diff:只看 diff 本身(不看着实现回忆意图),逐 hunk 问"这满足验收标准的哪一条?"
2. 按下方裁决清单逐项过,主动找错而非确认正确。
3. 产出与 subagent 评审同结构的发现清单。

## 裁决清单(reviewer 视角)

**规格符合**:对照任务的端到端行为与验收标准——缺失(要求了没做)、夹带(没要求却做了)、误解(做了但方向不对)。无法从 diff 判断的,标 ⚠️ 交回 controller 核实。

**代码质量**:真实行为测试而非 mock 行为;错误处理;命名;是否遵循设计的模块边界与数据结构;有没有过度构建(没要求的功能)。

每条发现必须带 `文件:行号` 与一句话理由。先列做得好的(校准信任),再列问题。

## 分级与处置

- **Critical**:错误行为、破坏数据、安全问题、测试伪造 → **暂停,询问用户**,修复前不进入下一任务。
- **Important**:需求缺失、脆弱实现、可维护性明显受损 → 修复后继续;修复需重跑覆盖该改动的测试。
- **Minor**:风格、命名、可选优化 → 记入开发记录,不阻塞;门 3 报告中汇总呈现。

修复后的复审按 [references/re-review-prompt.md](references/re-review-prompt.md) 模板派发 `reviewer`,并在派发时 reduced reasoning tier(model 参数传完整模型 id + `:low` 后缀;被注册表拒绝时回退默认档,不重试):只验证被标记的发现是否解决、修复本身有无引入新问题(范围收窄,不重新漫审)。同一发现修复两轮仍不过 → 升级为用户决策。

## 整特性终审(门 3 之前)

全部任务完成后,对 `git diff <特性起点>..<HEAD>` 做一次整体评审:任务间衔接、跨任务的一致性(命名/接口对齐)、以及各任务挂起的 Minor 是否需要在合并前处理。终审发现按同一分级处置;**每个修复必须有一次对应的复审**。

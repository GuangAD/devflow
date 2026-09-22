# 蒸馏工作流设计定稿

> 由 mattpocock/skills 与 obra/superpowers 两项目蒸馏而来,经苏格拉底式访谈逐项确认。
> 本文档是实施的唯一依据。
> 修订 v2(2026-09-09):依据 threejs-labs 三项目实证回顾,设计产物拆分为 design.md(决策快照,冻结)+ spec.md(实现规格,演进);seam 纪律升格为接口规格四件套+接口面穷举清单+变更记录。

## 一、定位与形态

- **使用者**:个人,日常编码,新项目与老项目混合场景。
- **形态**:pi 技能包 + 一个窄扩展(context-meter,2026-09-16 加入)。扩展只做一件事:注册只读工具 `context_usage`,按需返回上下文占比,供阶段 3 的上下文预算使用。**它不挂任何事件钩子、不注入任何消息**——注入要占用消息数组末位,而 pi 的 prompt cache 断点正落在最后一条文本内容上,常驻读数会让整段历史缓存失配。**流程仍全部由命令启动**。
- **气质**:命令启动、人守关键门、agent 在门之间自治。取 skills 的轻便与人机分工,取 superpowers 的行为铁律。

## 二、命令集

| 命令 | 职责 |
|---|---|
| `/dev <描述>` | 主入口。内置 classifier 路由轻/重/巨流程(light/heavy/huge track);重流程内置知识沉淀 |
| `/dev-map <描述>` | 决策地图:为模糊且巨大的需求分批探路,产决策不产代码,fog 散尽后汇入 /dev 重流程 |
| `/dev-doc` | 独立知识沉淀入口(与 /dev 内置共用同一底层技能) |
| `/dev-resume` | 恢复协议:读 plan.md → 核对 git → 查工作区 → 断点续做 |
| `/dev-review` | 代码库巡检:git 热点扫描 → 模块深化候选清单 |

## 三、classifier(位于 /dev 内部)

**判重(走重流程)信号**:新功能/新模块/新项目;动数据结构;新建文件多;用户说"做个/加个/实现一个";设计文档未覆盖的领域。
**判轻(走轻流程)信号**:修 bug、调文案、改配置、重构既有函数、plan.md 中已有对应任务。
**判巨(走 /dev-map)信号**:一次访谈装不下(design tree 一轮收不住,预计跨多会话才谈得清);存在"连问题都说不 sharp"的区域(不是缺答案,是缺问题);大到现在列不出完整的 design tree。
**判巨优先于判重**:先看一次访谈装不装得下,再谈轻重。
**拿不准**:问一句并给推荐——轻/重之间问"走完整设计流程,还是直接改?";重/巨之间问"一次访谈能谈清,还是先建地图探路?"

## 四、轻流程

零门,直接干。三个内建行为:

1. **即时澄清**:有歧义且不问会干错时,单句提问;否则按最合理理解干,完成后汇报假设。
2. **中途升级棘轮**:发现实为设计级改动(如修 bug 时发现根因在数据结构)→ 停下说明,重新分类转入重流程;发现是一次访谈装不下的大改造 → 转入 /dev-map。只可往自律方向升(轻→重→巨),不可反向降。
3. **根因先行**:修 bug 禁止症状式糊补;疑难 bug 升级为完整诊断纪律(建反馈回路 → 3-5 个可证伪假设 → 插桩 → 回归测试)。

默认 TDD(见第七节),完成时汇报 + 提交。

## 五、重流程

```
阶段 1 访谈(grilling 模式)
   design tree + round + 批量提问 + 每题附推荐答案
   事实 agent 自己查(必要时派 subagent),决策交用户
   内置知识沉淀:术语当场写 CONTEXT.md;够格决策写 ADR
   (ADR 三条件:难逆转 + 缺上下文会令人困惑 + 真实权衡)
   结束条件:design tree 无含糊分支,共识确认
        │
【门 1】设计文档+规格骨架确认
   docs/plans/<日期>-<特性>/ 下两份,进 git:
   design.md(决策快照,批准后冻结):目标 / 方案+模块划分鸟瞰(附可选 mermaid 架构图,图文互补) / 技术栈与依赖约束 / 权衡 / 开放问题
   spec.md(实现规格,随开发演进):数据结构说明 / seam 接口规格(按模块分节,模块名同 design 鸟瞰)
   (每条目四件套:签名 / 后置条件 / 副作用与可重入性 / 错误行为;
    每 seam ≥1 条 pinned case,期望值附事实源)/
   接口面穷举清单(全部模块公共导出,标 seam/非 seam)/
   非 seam 模块与视觉验收(数值预算必附机检方案)/ 空变更记录节
   写前过 design-checklist;违规检查:不得出现访谈未覆盖内容;
   seam 条目缺四件套或穷举清单不完整 = 视同开放问题非空
   排版纪律(门点读者是人):一个 bullet 一个事实、编号项分行、
   标题只放标识符、多组「输入 → 期望」对照用表格
        │
阶段 2 计划(不跑 grilling,机械分解)
   先把 spec.md 补全为用例详版(每 seam 3-8 条:典型+边界+反例)
   再切任务、排依赖、定验收标准——agent 的执行专业
   任务 = spec.md 一组 seam 条目从红到绿;vertical slice、可独立验收、单会话可容纳
   含编码方向与数据结构落地说明;大任务在此拆分
   任务格式:checkbox + 完成后回填 commit 哈希
   边界规则:①切任务时暴露设计级空白 → 棘轮回退:
   补访谈、改 design.md 与 spec.md 骨架、重过门 1,禁止在 plan.md 夹带设计决策;
   ②纯计划级但属用户偏好的(如独立任务的先后顺序)
   → 给推荐单点问,或在 plan.md 写明推荐顺序待门 2 一并批
        │
【门 2】规格详版+计划确认(修订循环)
   docs/plans/<日期>-<特性>/ 的 spec.md 用例详版与 plan.md,进 git
   批计划 = 批拆分+批用例详版,不另设门;吸收 skills to-tickets 的盘问三连:
   粒度/依赖/合并拆分,对成文稿提意见,迭代到批准
        │
阶段 3 开发(自治,任务间不停顿)
   按依赖拓扑序串行:重算 ready set → 取一个 → 实现 → 验证 → 评审 → commit → 勾选
   实现优先派 implementer subagent(过程留在它的上下文里);无 subagent 才在 controller 会话内实现
   串行而非并行:vertical slice 天然共享文件 + 无 worktree 隔离 + 每任务一 commit 需线性历史
   上下文预算只在会话内实现时需要:先调 context_usage 工具读占比(≥ 45% 提示切换,传感器与策略分离);
   工具不可用退回可数信号(同一节三读 / 连续两任务回翻前文 / 记不清早前决定)
   仅 Critical/偏离计划/implementer 停手时暂停询问;Important/Minor 记录后续行
        │
【门 3】最终确认
   验收清单逐项结果 + 评审记录 + TDD waiver 清单 + 产出一览
   确认后收尾(清理 / 总结;spec.md 变更记录节默认原样留档,
   行数拖累 resume 回读时折叠为摘要并注明完整记录见 git 历史)
```

## 六、巨流程(地图层)

判巨时路由到 `/dev-map`。它补的是重流程(heavy track)的结构性死角:门 1 要求"design tree 无含糊分支",而巨大需求的开放问题短期清不空,硬进重流程只会卡在门 1 前无限访谈。

地图 = `docs/maps/<日期>-<slug>/map.md`,进 git,五节:destination / 备注 / 已定决策 / fog / out of scope。它是索引不是仓库:决策只存在自己的 ticket 里,地图只存一行 gist,不复述结论。

- **destination 先定**:它定死范围,out of scope 的关掉;每个会话开工前先读它再选 ticket。
- **ticket**:一行一张,checkbox + 回填 commit 哈希(同 plan.md 记账法),四型——调研(AFK,派 subagent)/ 原型(HITL)/ 访谈(HITL,默认,调 grilling + domain-docs)/ 任务(本身非决策,但解锁某个决策)。
- **fog vs ticket 的判据**:看你现在能不能把问题说**精确**,而不是能不能回答。能说精确就开 ticket(哪怕它还被阻塞);说不清就留在 fog 里。**别把 fog 预切成 ticket 大小的块**——fog 比 ticket 粗,一块 fog 可能毕业成几张 ticket,也可能一张都不成。
- **out of scope 不是 fog,永不毕业**:已开的 ticket 若落在 destination 之外则关掉它,在 out of scope 节留一行原因。范围边界不进「已定决策」——那是记录实际走过的路。
- **每会话最多解一个 ticket**(调研 ticket 除外);认领是 git fallback 版:无 tracker 的 assignee,靠"每会话一 ticket + 解完即提交"防并发撞车。
- **出口**:fog 散尽、frontier 空 → 汇总已定决策进 `/dev` 重流程,design.md 从已定决策直接生成,访谈只补门 1 自查发现的具体空白。地图留档不删。
- **退出条件**:建图的第一次广度扫描若没扫出 fog,就不需要地图,停下问用户怎么走。

## 七、开发纪律

- **TDD 默认制 + waiver allowlist**:默认每任务先写失败测试、亲眼看红、再实现。waiver 范围:纯配置/文案、无逻辑静态调整、一次性脚本、文档。waiver 裁量权在 agent,但必须留痕说明理由。
- **mutation check**:为已发现的缺陷补写的 pinned case,落地前须撤销(或改坏)那行修复,确认该用例确实转红且红的正是这一条,再改回确认全绿;改坏了仍全绿说明断言空心,需加强到能失败为止。结果在开发记录留痕。它是「亲眼看红」的另一半:TDD 保证这条用例不是一开始就绿,mutation check 保证它不会退化成永远绿。
- **每任务一 commit**:挂机可断点恢复,git 历史即进度;门 3 定位为确认收尾而非批准提交。
- **评审独立**:评审由 subagent 执行,implementer 不 self-review 放行;发现按 Critical/Important/Minor 分级;Minor 记录不阻塞。工程约定:reviewer 用 pi-subagents 内置定义、不做本地改动以保持上游同步;diff 走项目内相对路径文件(`.review/`,禁 /tmp 跨环境路径,使用方仓库 `.gitignore` 须含 `.review/`,首次写入前检查),不可读时快速失败(BLOCKED 重派),禁止通读工作区替代;diff 文件随任务提交即删,门 3 清空 `.review/`;reviewer 无 shell,controller 派发前跑完测试并附输出,报告禁悬置验证清单;评审可异步,处置发现前不提交下一任务;复审按专用模板逐条核对并 reduced reasoning tier(派发时指定),不重新漫审。
- **环境前提(角色名解析)**:implementer 与 reviewer 是角色名,由环境的 subagent/任务工具解析承接(pi-subagents 内置 `worker` 的别名含 implementer、内置 `reviewer` 为只读);dev 阶段 3 要求派发前先探测,环境无承接能力即走各步 fallback(会话内实现 / self-review 标注"非独立"),本包不做本地副本。
- **证据先于声称**:宣称完成前必须本回合跑过验证;agent 自述不算数,以 git 与测试输出为准。
- **seam 纪律**:测试只写在门 1 确认过的 seam 上;seam 接口在 spec.md 有规格条目(四件套:签名/后置条件/副作用与可重入性/错误行为)+ pinned case;期望值来自独立事实源(手算/外部锚点/构造反例),禁止同义反复断言。接口面穷举清单覆盖全部公共导出;实现期计划外导出与规格修订一律登记 spec.md 变更记录;spec.md 与 design.md 冲突以 design.md 为准,触及 design 决策走回退协议。
- **任务执行引擎与上下文预算**:阶段 3 的实现优先派**implementer subagent**(模板见 `dev/references/implementer-prompt.md`),把实现过程隔离在它自己的上下文里,controller 只承接验证输出与评审报告;subagent**不提交**,commit 仍由 controller 统一做,以保证「每任务一 commit」的线性历史。环境无 subagent 才退回会话内实现,此时按**按需切换**管理上下文。判据有优先级:**先调用 devflow 扩展注册的 `context_usage` 工具读一次占比——扩展只报数,阈值与处置在本节定义(占比 ≥ 45% 提示切换,低于则零打断)**;工具不可用(未装扩展,或读数暂不可用如刚压缩完)才用三条可数信号——同一节文档在本会话内第三次重读、最近两个任务都需回翻前文才能确认接口、已记不清早前决定只能靠 git 或文档反查——另有「完成 4 个任务后至少检查一次」的底线把检查固定成动作。之所以要求可数:模型无法感知自身上下文占用,上下文压力最先损害的正是"感觉到自己挤了"这个能力,纯主观判据等于没有判据;而用量只有 harness 知道,扩展通过 `ctx.getContextUsage()` 取到它、由工具在任务边界按需返回,agent 才看得到。用工具而非常驻注入是刻意的:注入要占消息数组末位,而 pi 的 prompt cache 断点正落在最后一条文本内容上,常驻读数会让整段历史缓存失配。主动切换与被动中断同一条协议。**依赖用拓扑序处理**:每次做下一个任务前重算 ready set,串行执行。串行而非并行是形态决定的三条理由:任务是 tracer-bullet vertical slice、天然共享注册文件与类型导出 barrel;devflow 已舍弃 worktree 隔离,没有隔离就没有并行安全前提;并发提交会把线性历史拆成需要 merge 的分叉。串行顺带消化了隐性依赖——上游提交后代码已真实存在于工作区,下游读代码即可,`plan.md` 的「依赖」主要用于决定顺序而非穷举耦合。实现的推理过程中有跨会话价值的部分,通过「下一步用得上的结论」落进 plan.md 开发记录,这是唯一的软依赖通道。

## 八、回退协议

- **计划阶段发现设计错误**(agent 发现或用户在门 2 提出):回到访谈,只重开 design tree 上受影响的分支;修订 design.md 与 spec.md 骨架重过门 1;补全用例详版、重写 plan.md 重过门 2。此时代码不存在,回退零成本。
- **开发中发现设计错误**:受设计变更作废的任务精确 git revert(逐任务提交使爆炸半径可计算);存活任务原样保留并搬入新计划;然后走计划阶段的同一条回退线。门 3 验收清单对账原设计产物与返工产物。
- **设计变更推翻某条 ADR**:ADR 不可修改只可被取代——旧 ADR 标注"已被 NNNN 取代",新决策写新 ADR,保留完整推理链。CONTEXT.md 术语就地更新。
- **agent 义务**:任何阶段发现设计缺陷,停下来报告,不将错就错、不在计划里偷偷绕过;报告须含:缺陷是什么、影响哪些已完成任务、建议的修订方向。

## 九、状态落盘与恢复

- 一切执行状态在 plan.md(勾选 + commit 哈希 + 开发记录节——块格式:ledger 首行 + 字段缩进子行,空字段省略)与 spec.md 变更记录(接口真值 ledger),不在会话上下文里。
- 上下文压缩/换会话后:信文档与 git 历史,不信记忆;续做前必须重读 design.md + spec.md(含变更记录)+ plan.md。
- `/dev-resume` 恢复协议:①读 design.md + spec.md(变更记录)+ plan.md;②看勾选状态;③git log 双向核对(勾了但 commit 不在 → 报告并以 git 为准修正;commit 在但勾选缺 → 系「提交后落盘前」中断,补勾选补落盘、不重做);④git status 检查工作区残局(未完成任务:判断"写完还是丢弃",判断不了问用户);⑤从第一个未勾选任务继续。

## 十、知识沉淀

- `CONTEXT.md`(仓库根):纯词汇表,零实现细节。术语在访谈中被锐化的当场写入。
- `docs/adr/NNNN-<slug>.md`:仅三条件全满足才写;ADR 同时是"别再提了"清单——后续建议与其冲突时须明确标注并给重开理由。
- `docs/plans/<日期>-<特性>/`:design.md + spec.md + plan.md 三件成套,进 git,作为设计依据与接口真值的第一手证据。
- `docs/maps/<日期>-<slug>/`:map.md 决策地图,进 git,作为"destination 与 out of scope 为什么这么定"的第一手证据;走完后不删。

## 十一、本期不做(留档)

- subagent 流水线执行器(controller/implementer/reviewer 分离)——大型任务的可选升级档
- triage 工单分诊、并行 subagent 排查
- per-repo setup 命令——改用运行时自动探测(按 package.json/Cargo.toml 等推断测试命令,探测不到当场问)

## 十二、借用来源对照

| 机制 | 来源 |
|---|---|
| grilling 访谈(design tree/round/推荐答案) | skills |
| CONTEXT.md 词汇表 + ADR 三条件 | skills |
| tracer-bullet 任务/seam 纪律 | skills |
| 双向评审纪律(分级、不自我放行) | superpowers |
| 复审专用模板(scoped re-review,逐条裁决不漫审) | superpowers |
| 亲眼看红 TDD + 合理化防御 | superpowers(waiver 制为蒸馏改动) |
| 根因先行诊断 | 两项目共有,取 skills 六阶段 |
| 证据先于声称 | superpowers |
| 状态落盘/ledger 思想/恢复协议 | superpowers(轻量化为 checkbox) |
| 升级棘轮 | superpowers brainstorming |
| 命令驱动、人掌舵 | skills |
| mutation check(pinned case 的鉴别力自检) | 新造:pi-w 实证过程中由评审处置长出,两项目均无 |
| 决策地图(destination/fog/ticket/out of scope) | skills wayfinder(2026-09-15 补采;原列舍弃清单,形态改为无 tracker 的 git 落盘) |

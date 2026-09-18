# ROADMAP

## 当前阶段

**v3.0.0 已发布,并完成发布后首次实战实证**:pi-usage(pi 会话用量分析器),2026-09-16~17 走完重流程全链路(6 任务 / 15 次子代理派发 / 三道门),暴露子代理写入通道、reviewer 取证口径、平台类验收等新维度问题,对应的阶段 3 子代理纪律硬化已于 2026-09-17 回流本仓库(见已完成末条)。首次实证 pi-w(v2)的结论摘要如下。

实证结论摘要(承重机制见 `../analysis/03-distilled-workflow-design.md` 第七节,执行证据见 pi-w 自身 plan.md 的开发记录):

- **咬得住**:design.md 的冻结语义在开发期没有被侵蚀,spec.md 留了 15 条变更记录如实登记实现期修订,没有出现「文档写过就算」的空转。
- **规格四件套确实在拦**:门 3 前的独立终审靠接口面穷举清单的完备性检查,抓出 self-review 漏登的 `web/src/types.ts` 全部 19 个类型导出。清单是被真用起来核对的,不是写完就放着。
- **回退协议全程未被触发**:design.md 一次也没被推翻;两次文档修订都走的是 spec.md 演进路径(任务 3 的用例笔误更正、门 3 M4 语义落差的连带修订)。轻量 Fix 不升级为设计回退,这条路走得通。
- **代价落在维护上**:spec.md 长约 466 行、需持续登记变更记录,是本次最重的文档开销;换来的是门 1 之后几乎不再返工。下一个项目应继续观察这份开销是否随特性规模线性增长。

下一步:发布下一版 ref 后重装验证安装链路;pi-w 遗留的 v2.1.0 模板回流见待办。

## 已完成

- 2026-09-09 v2 流程变更(源自 threejs-labs 三项目实证回顾):
  - 新增 `skills/dev/references/spec-template.md`(实现规格模板:接口四件套+pinned case+接口面穷举清单+非 seam 与视觉验收+变更记录)
  - 新增 `skills/dev/references/design-checklist.md`(设计自查清单,沉淀 10 条历史教训)
  - 重写 `skills/dev/references/design-template.md`(决策快照:背景/目标/方案/技术栈与依赖约束/权衡/开放问题,头部声明冻结语义)
  - `dev/SKILL.md`:阶段 1 写两份文档、门 1 批两份、阶段 2 先补用例详版再按接口组切任务、门 2 批详版+计划、阶段 3 变更记录义务、回退协议补 spec/design 冲突规则
  - `plan-template.md`:接口组字段、waiver 预登记写法、验收标准机检/目测分类
  - `tdd/SKILL.md`:用例表为红绿依据、期望值事实源、数值预算断言化、waiver 预登记
  - `code-review`:评审简报与派发模板加入 spec.md 接口组粘贴节
  - `dev-resume/SKILL.md`:恢复读取清单加入 spec.md(含变更记录)
  - `README.md` 与 `../analysis/03-distilled-workflow-design.md` 同步(修订 v2 注记)
- 2026-09-09 pi 包化:仓库根新增 package.json(pi 清单指向 devflow/skills 与 devflow/prompts,keyword pi-package);新增根 README.md;devflow/README 安装节改为 pi install git:github.com/GuangAD/devflow 为首选,install.sh 标注废弃;安装形态从「复制目录」升级为「git 地址安装+ref 锚定」
- 2026-09-14 01:34 design-template 方案概述节新增「模块划分鸟瞰」要求(A 单独可读:3-5 行模块组成与职责边界,签名仍归 spec);同步 analysis/03 门 1 清单;pi-w 首个验证项目的 design.md 已按新要求补写
- 2026-09-14 01:40 spec-template seam 接口规格改为按模块分节(### 模块路径同 design 鸟瞰/#### 条目),穷举清单按模块排序,编码方向明确按包分组——A 鸟瞰、B 模块节、plan 接口组三者词汇对齐
- 2026-09-15 tdd 纪律新增「mutation check(反向验证)」(源自 pi-w 实证过程中由评审处置长出的做法):为已发现缺陷补写的 pinned case,落地前须撤销修复并确认该用例确实转红、且红的正是这一条,再改回确认全绿;改坏后仍全绿视为断言空心,需加强到能失败为止;结果在开发记录留痕。同步点:tdd/SKILL.md 新增同名节并更新 frontmatter description、analysis/03 第六节新增对应条目、analysis/03 第十一节来源表新增一行(标记为新造)、根 README 纪律技能行补 tdd 描述、plan-template 开发记录注释补记 mutation check 结果
- 2026-09-15 新增 `/dev-map` 决策地图(补采上游 wayfinder,原列舍弃清单 ①「场景不符」):
  - 新增 `skills/dev-map/SKILL.md` + `skills/dev-map/references/map-template.md` + `prompts/dev-map.md`;地图为 `docs/maps/<日期>-<slug>/map.md` 单文件,五节(destination/备注/已定决策/fog/out of scope),ticket 用 checkbox + commit 哈希,认领 fallback 为「每会话一 ticket+解完即提交」
  - `dev/SKILL.md`:classifier 二分→三分(新增判巨信号:一次访谈装不下、有说不 sharp 的区域;判巨优先于判重),新增「巨流程(路由到 /dev-map)」节,阶段 1 增加「已有地图时已定决策直接作为访谈既有共识」,升级棘轮改为只可轻→重→巨单向升,frontmatter description 同步
  - `analysis/03`:命令集与 classifier 改三分;新增第六节「巨流程(地图层)」,原六~十一节顺延为七~十二(同步修正文内「见第六节」与本文件此处的节号引用);第十一期不做移除 wayfinder;第十节知识沉淀新增 docs/maps;来源表新增 wayfinder 行(标注原列舍弃、2026-09-15 补采)
  - `analysis/04`:wayfinder 从舍弃清单 ① 移入第二节采用表(7 项→8 项),并加注补采理由
  - 两份 README 同步(命令四个→五个、纪律技能 10→11 项、结构树、使用示例、留档清单移除 wayfinder)
- 2026-09-15 阶段 3 引入双形态执行引擎(解决上下文随任务数单调累积——状态已落盘,工作记忆没有):
  - 新增 `skills/dev/references/implementer-prompt.md`:implementer subagent 派发模板,输出格式含「下一步用得上的结论」字段(跨会话唯一的软依赖通道)
  - `dev/SKILL.md` 阶段 3:实现改为「优先派 implementer subagent / fallback 会话内实现」两形态;新增「依赖与派发顺序」小节(DAG ready set + 串行的三条形态理由)与「上下文预算」小节(无 subagent 时按需切换到 /dev-resume,而非每任务必切)
  - `plan-template.md`:依赖字段区分硬依赖与顺序偏好;开发记录示例与注释新增「结论」字段
  - `dev-resume/SKILL.md`:第二步读取清单加入开发记录的「结论」;纪律新增「主动切换与被动中断同一协议」与「恢复后先重算 ready set」
  - `analysis/03` 阶段 3 图示重写、第七节新增「任务执行引擎与上下文预算」;`analysis/04` 舍弃②标注 SDD 任务简报部分启用与 worktree 被砍的连带代价、第四节新造新增一行
  - `devflow/README` 同步(执行引擎取舍行、门自治说明、references 清单、implementer subagent 的三条边界、留档清单)
- 2026-09-16 两项改动:
  - **术语英文化(全链路)**:正文技术术语改用英文(A 类 22 项:subagent/seam/design tree/round/frontier/ready set/controller/implementer/reviewer/self-review/classifier/destination/fog/ticket/out of scope/ledger/waiver/fallback/pinned case/tracer-bullet/vertical slice/reduced reasoning tier),叙述仍用中文;devflow 自造词(轻/重/巨流程、反向验证、曳光弹切片)正文保留中文,英文仅供检索。范围:devflow 全部 skills/prompts/README/ROADMAP + analysis 四篇 + 根 README + package.json,共 25 个文件
    - skill 与 prompt **两层 description 均改为中英并存**——description 是路由层(渐进披露时 agent 只读它),只留一种说法会让对应触发路径失效
    - `devflow/README.md` 新增「术语表」24 行中英对照,承载自造词的英文检索,避免正文到处嵌括注
    - 保留不动:上下文/会话/访谈(B 类)、门/回退协议(C 类)、边缘词(词汇表/摩擦/深化/门卫)
    - 复查发现并修复三类英译粘连(替换规则顺序导致长模式被短模式先吃:`实现者子代理`→`implementersubagent` 等),已全仓清零
  - **上下文预算判据收紧**:原判据「后续任务不需要频繁重读 design/spec/plan 才能继续」是自指的软判据——上下文压力最先损害的正是"感觉到自己挤了"这个能力。改为三条可数信号(同一节文档本会话内第三次重读 / 最近两任务都需回翻前文才能确认接口 / 已记不清早前决定只能靠 git 或文档反查)+ 底线(完成 4 个任务后至少检查一次);`dev/SKILL.md` 阶段 3「上下文预算」节与 `analysis/03` 图示、第七节同步
  - **新增窄扩展 `extensions/context-meter.ts`**(devflow 首个非技能产物):模型无法感知自身上下文占用,pi 也不把用量放进模型可见的上下文(它只在 TUI footer 给人类看),故由扩展读取 pi 官方接口 `ctx.getContextUsage()`,**注册只读工具 `context_usage`**,供 dev 阶段 3 在任务边界按需调用
    - **传感器与策略分离**:扩展**只报数,不含任何阈值判断**;占比是否超标、何时去读,都写在 `dev/SKILL.md` 的「上下文预算」节(≥ 45% 提示切换)——改线不改代码、不重装包
    - **形态是工具而非注入**(2026-09-16 改定):早先版本挂在 `context` 钩子上、把读数追加到消息末尾。那会**夺走 prompt cache 的 message 级断点**——pi 把断点放在「最后一条 user/assistant/tool-result 文本内容」上(见 pi 文档 `models.md` 的 `cacheControlFormat` 说明),于是下一轮该位置换成别的消息,缓存条目「历史 + 读数行」不再是新请求的前缀,**整段历史命中不了**。改工具后读数只在被调用时进上下文,而那些位置本来就会被新内容顶掉。测试里有一条硬断言:**不注册任何事件钩子**
    - 数据来源与 TUI footer 同源(见 `@earendil-works/pi-coding-agent` 的 `footer-data-provider.d.ts`):末条 assistant 的真实 `usage` + 尾随消息估算,`contextWindow` 取当前模型实际窗口,故不写死窗口大小;接口返回 `tokens: null` 时(如刚压缩完)如实说明而不猜
    - 挂载:`package.json` 的 `pi.extensions` 指向该文件(与 `pi.skills`/`pi.prompts` 并列);同时补 `"type": "module"`,否则 Node 会因 `export default` 触发 ESM 重解析
    - **零运行时依赖**:`parameters` 必填且要求 TypeBox schema,而 TypeBox schema 即普通 JSON Schema,故写字面量 + `import type`(会被擦除)。取值 import `typebox` 会因解析不到该包而加载失败——它只存在于 pi 自己的依赖树里
    - `dev/SKILL.md` 阶段 3 第 8 步加入「调用 `context_usage`」,上下文预算节改为「工具 → 三条可数信号」两级降级;`analysis/03` 第一节「形态」由「pi 纯技能包、无扩展」改写、第七节同步;`analysis/04` 舍弃②标注 session hook 被部分回收、第四节新造新增一行;两份 README 同步
    - 测试已入库(本包唯一不能靠人工核对的产物):`devflow/extensions/context-meter.test.mjs`
- 2026-09-16 首次执行自我沉淀(用本包自己的 `/dev-doc`),补齐本仓库自身的知识层两层——此前这两个位置都是空的:
  - **根目录 `CONTEXT.md`** 领域词汇表 20 条,分三组:流程分层(轻/重/巨流程、三道门、升级棘轮)、巨流程(决策地图、destination、ticket、fog、frontier、out of scope)、开发(tracer-bullet slice、vertical/horizontal slice、ready set、implementer subagent、reviewer/self-review fallback、controller、seam、pinned case/mutation check/waiver、上下文预算与传感器策略分离)。按 `domain-docs` 格式写(一句话定义 + 边界 + 反义/易混淆),**不含实现细节**
  - **`docs/adr/`** 架构决策记录 4 条:0001 巨流程用无 tracker 的决策地图承载 / 0002 实现任务串行派发 / 0003 上下文读数以只读工具形态进入 / 0004 术语英文化采用分层策略。每条只记「为什么不是另一种做法」,**不复述流程细节**——流程细节的单一真值仍是 `analysis/03`,这样切是为了避免两份文档漂移
  - 门槛筛查剔除 4 项不合格候选(阈值写在哪 / 三条可数信号 / 保持命令启动 / 判巨优先于判重):它们要么改一行 Markdown 就能调、不算难逆转,要么已由 `analysis/03`、`analysis/04` 覆盖
  - 顺带查出一处真冲突并统一:`frontier` 在本仓库有**两个含义**(grilling 语境的"现在就能问的问题集" vs 决策地图语境的"可解的 ticket 集合"),已在 `CONTEXT.md` 分开定义并注明与 ready set 的分层差异
  - 交叉链接:根 README 新增「文档」两条指针、`devflow/README` 术语表加注「本表只做中英对照,定义见 CONTEXT.md」、维护说明新增一条(术语就地改,ADR 只可被取代)。位置经核实正确——`package.json` 只声明 `skills`/`prompts`/`extensions`,故根 `CONTEXT.md` 与 `docs/adr/` 不会被 `pi install` 带进用户项目
  - 对齐过期数字:本文件上方条目原写判据 ≥ 60%,而 `dev/SKILL.md` 实际为 **≥ 45%**,已改齐(该 60% 亦出现在 2026-09-16 的提交信息里,提交信息不改)
- 2026-09-16 **发布 v3.0.0**(tag 见本提交):起点 v2.1.0。本版内容即上方 2026-09-15~16 各组条目之和——`/dev-map` 巨流程与决策地图、阶段 3 双形态执行引擎与上下文预算、术语英文化、窄扩展 `context_usage`、根 `CONTEXT.md` + `docs/adr/` 知识层
  - **为何进主版本号**:术语英文化改动了技能与命令两层 `description` 的措辞,等于改触发行为;仓库形态也从「技能 + 命令」扩为「技能 + 命令 + 扩展」。两者都不是向后兼容的
  - 安装 ref 同步:根 README 与 `devflow/README` 各一处从 `@v2.0.0` 改为 `@v3.0.0`
  - tag 沿用既有约定:附注 tag,消息形如 `devflow vX.Y.Z:<要点列表>`
- 2026-09-16~17 pi-usage(pi 会话用量分析器)完成 v3.0.0 发布后首次重流程实证:6 任务 / 15 次子代理派发 / 三道门全程,回退协议与上下文预算(全程 ≤ 21%)表现符合设计;首次暴露三类新维度问题——implementer 违纪自行派发 subagent 且误信沙箱写入结果(「沙箱写入 ≠ 工作区落盘」,写入通道核查缺失)、reviewer 行号级误报(patch 坐标偏移)与「你没有 shell」措辞同实际工具集不符、平台类验收被等价替代测试假闭环。完整复盘见 pi-usage 项目 plan.md 开发记录
- 2026-09-17 07:35 阶段 3 子代理纪律硬化(源自 pi-usage 实证,六处技能契约):
  - `dev/SKILL.md` 阶段 3 第 3 步:implementer 报告声称的改动清单须与 `git status` 实况逐项核对,不符即整体降信——不采信一切未核实主张、全部亲验、违例记录在案
  - `implementer-prompt.md`:第 5 条补能力声明(不具备派发能力,也不要尝试;超范围写进「偏离与阻塞」),新增第 7 条写入自证(完成后运行 git status,实况原文粘贴进「工作区改动」节,禁凭记忆或转述)
  - `reviewer-prompt.md`:取证纪律第 3 条改环境无关措辞(取证只限差异文件与指定文件的只读阅读,命令类核查一律交 controller 代跑,环境实际带 shell 也不得使用);「取证方式」节改列实际使用的工具与代跑请求;controller 处置速查表加两行——报告行号一律视为 patch 内坐标(裁决前核对源码实况)、评审声称与源码实况分歧走「读源码静态路径证明 + 交复审者复核裁决」链,不临时改产品代码做变异
  - `tdd/SKILL.md`:mutation check 节新增归属声明——变异由正在改动这些文件的 implementer 在红绿循环内完成,controller 不代做
  - `verification/SKILL.md`:新增「不可达验收项」节——本机不可达即显式标注「未验证」并保留为遗留事项,禁止以不等价替代测试关闭验收项
  - `plan-template.md`:验收标准加门 2 不可达项预判;开发记录行内先记 BASE 短哈希(回退协议的 diff 基线,消「实际没错、字面没做」的偏离)
- 2026-09-17 08:31 design-template「方案概述」支持可选 mermaid 架构图:图承载模块间依赖方向与数据流向,与文字鸟瞰互补不重复(图不复述职责描述),按需画、属 design.md 冻结范围;design-checklist 加对应自查条目(图文一致、开发期修订走回退协议);analysis/03 门 1 清单同步

- 2026-09-18 07:33 seam 覆盖三层模型(源自 pi-web 中文金额转换器的边界覆盖讨论:8 条用例表盖不住零合并的维度组合):用例表定位收窄为「人审契约锚点,定规则」,覆盖标准改由新增的「覆盖声明」承载(等价类矩阵 + 机检铁律 + 枚举范围,门 2 批准「测到什么程度算全」),实现期照单兑现、发现维度漏项走 spec 变更记录回填、评审按声明审计。同步点:`spec-template.md` 节注释更新并在 pinned case 后加覆盖声明块;`dev/SKILL.md` 阶段 2 用例详版描述补覆盖声明;`design-checklist.md` 新增组合边界型 seam 自查条目;`tdd/SKILL.md` 默认制第 1 步补兑现要求并新增「覆盖兑现与回填」节;`code-review/SKILL.md` 与 `reviewer-prompt.md` 评审对照物加入覆盖声明
## 进行中

无。

## 待办

- **优先 · v2.1.0 模板回流**:pi-w 的 ab9db9f 记为「按 v2.1.0 模板重写设计与规格」,该次对 design/spec 模板的改动尚未回写本仓库,项目侧与本仓库两份不同步
- 变更记录机制评估:pi-w 已产生 15 条真实登记,可据此判断是否回填新的 design-checklist 条目
- 下一个实证项目继续观察:spec.md 的维护开销是否随特性规模线性增长(本次约 466 行)
- 巨流程待实证:`/dev-map` 尚未在真实项目跑过。观察点两条——判巨信号在真实需求上是否好用(会不会把"重"误判成"巨",使地图层变成必交的作业),以及地图走完后 design.md 从已定决策生成是否真省掉了门 1 的大半访谈
- implementer subagent 待实证:观察三点——派发简报的信息量是否够 subagent 独立完成任务(频繁 ⚠️ 或擅自扩接口 = 简报不足)、controller 上下文的实际降幅有多大、「下一步用得上的结论」的留空率是否过高(过高说明这个字段设计得不对)
- (已安装副本同步)仓库内技能更新后,需重新复制或软链到 pi 技能目录方可在会话中生效

## 阻塞

无。

## 最近验证

- 2026-09-18 07:33 本次改动交叉引用一致性检查:`grep 覆盖声明` 于 skills 目录 7 处命中(spec-template 2 / tdd 3 / dev 1 / design-checklist 1 / code-review 2),与计划改动点一一对应、无断链;spec-template.md 与 tdd/SKILL.md 改后全文通读,markdown 结构完好(覆盖声明块嵌套、新节位置在 mutation check 与卡住对照表之间);「3-8」表述全文仍仅指用例表,上限语义未变。人工核对通过
- 2026-09-16 `extensions/context-meter.test.mjs` 14 项全过(注册名与 schema / **未注册任何事件钩子** / 低占比照实报出,证明不做阈值判断 / 高占比照实报出 / 报数含绝对量与窗口 / 读数不可用的三种情形都如实说明 / 窗口为 0 不除零 / 窗口变大时同样 tokens 占比下降)。运行:`node --experimental-strip-types devflow/extensions/context-meter.test.mjs`
  - 其中「未注册任何事件钩子」是**结构性断言**:它保证扩展不注入消息、不吃 prompt cache,是一旦有人想改回注入就会立刻变红的那道闸
- 2026-09-09 全包交叉引用一致性检查:旧引用(「design.md 测试策略节」)已清零;spec.md/design-checklist 引用链完整;plan-template 任务详情节无残留重复行(人工核对通过)。**注**:自 2026-09-16 起本包不再是纯 Markdown,含一个 `.ts` 扩展,其行为由上述测试覆盖,不能只靠人工核对

# ROADMAP

## 当前阶段

**v2 已通过首个真实项目实证**:pi-w(家庭账本 AA 拆分),2026-09-14~15 走完三道门,12 任务 / 21 笔提交 / 155 用例全绿。

实证结论摘要(承重机制见 `../analysis/03-distilled-workflow-design.md` 第六节,执行证据见 pi-w 自身 plan.md 的开发记录):

- **咬得住**:design.md 的冻结语义在开发期没有被侵蚀,spec.md 留了 15 条变更记录如实登记实现期修订,没有出现「文档写过就算」的空转。
- **规格四件套确实在拦**:门 3 前的独立终审靠接口面穷举清单的完备性检查,抓出自审漏登的 `web/src/types.ts` 全部 19 个类型导出。清单是被真用起来核对的,不是写完就放着。
- **回退协议全程未被触发**:design.md 一次也没被推翻;两次文档修订都走的是 spec.md 演进路径(任务 3 的用例笔误更正、门 3 M4 语义落差的连带修订)。轻量 Fix 不升级为设计回退,这条路走得通。
- **代价落在维护上**:spec.md 长约 466 行、需持续登记变更记录,是本次最重的文档开销;换来的是门 1 之后几乎不再返工。下一个项目应继续观察这份开销是否随特性规模线性增长。

下一步:把实证长出的经验回流完(v2.1.0 模板见待办)。

## 已完成

- 2026-09-09 v2 流程变更(源自 threejs-labs 三项目实证回顾):
  - 新增 `skills/dev/references/spec-template.md`(实现规格模板:接口四件套+钉住用例+接口面穷举清单+非接缝与视觉验收+变更记录)
  - 新增 `skills/dev/references/design-checklist.md`(设计自查清单,沉淀 10 条历史教训)
  - 重写 `skills/dev/references/design-template.md`(决策快照:背景/目标/方案/技术栈与依赖约束/权衡/开放问题,头部声明冻结语义)
  - `dev/SKILL.md`:阶段 1 写两份文档、门 1 批两份、阶段 2 先补用例详版再按接口组切任务、门 2 批详版+计划、阶段 3 变更记录义务、回退协议补 spec/design 冲突规则
  - `plan-template.md`:接口组字段、豁免预登记写法、验收标准机检/目测分类
  - `tdd/SKILL.md`:用例表为红绿依据、期望值事实源、数值预算断言化、豁免预登记
  - `code-review`:评审简报与派发模板加入 spec.md 接口组粘贴节
  - `dev-resume/SKILL.md`:恢复读取清单加入 spec.md(含变更记录)
  - `README.md` 与 `../analysis/03-distilled-workflow-design.md` 同步(修订 v2 注记)
- 2026-09-09 pi 包化:仓库根新增 package.json(pi 清单指向 devflow/skills 与 devflow/prompts,keyword pi-package);新增根 README.md;devflow/README 安装节改为 pi install git:github.com/GuangAD/devflow 为首选,install.sh 标注废弃;安装形态从「复制目录」升级为「git 地址安装+ref 锚定」
- 2026-09-14 01:34 design-template 方案概述节新增「模块划分鸟瞰」要求(A 单独可读:3-5 行模块组成与职责边界,签名仍归 spec);同步 analysis/03 门 1 清单;pi-w 首个验证项目的 design.md 已按新要求补写
- 2026-09-14 01:40 spec-template 接缝接口规格改为按模块分节(### 模块路径同 design 鸟瞰/#### 条目),穷举清单按模块排序,编码方向明确按包分组——A 鸟瞰、B 模块节、plan 接口组三者词汇对齐
- 2026-09-15 tdd 纪律新增「反向验证」(源自 pi-w 实证过程中由评审处置长出的做法):为已发现缺陷补写的钉住用例,落地前须撤销修复并确认该用例确实转红、且红的正是这一条,再改回确认全绿;改坏后仍全绿视为断言空心,需加强到能失败为止;结果在开发记录留痕。同步点:tdd/SKILL.md 新增同名节并更新 frontmatter description、analysis/03 第六节新增对应条目、analysis/03 第十一节来源表新增一行(标记为新造)、根 README 纪律技能行补 tdd 描述、plan-template 开发记录注释补记反向验证结果

## 进行中

无。

## 待办

- **优先 · v2.1.0 模板回流**:pi-w 的 ab9db9f 记为「按 v2.1.0 模板重写设计与规格」,该次对 design/spec 模板的改动尚未回写本仓库,项目侧与本仓库两份不同步
- 变更记录机制评估:pi-w 已产生 15 条真实登记,可据此判断是否回填新的 design-checklist 条目
- 下一个实证项目继续观察:spec.md 的维护开销是否随特性规模线性增长(本次约 466 行)
- (已安装副本同步)仓库内技能更新后,需重新复制或软链到 pi 技能目录方可在会话中生效

## 阻塞

无。

## 最近验证

- 2026-09-09 全包交叉引用一致性检查:旧引用(「design.md 测试策略节」)已清零;spec.md/design-checklist 引用链完整;plan-template 任务详情节无残留重复行(人工核对通过,本包为纯 Markdown,无自动化测试)

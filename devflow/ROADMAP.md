# ROADMAP

## 当前阶段

v2 流程强化已完成:设计产物拆分(design.md 决策快照 + spec.md 实现规格)与门 1 前置自查已写入全部技能与模板,待下一个真实项目实证。

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

## 进行中

无。

## 待办

- 用下一个真实重流程项目实证 v2:重点观察门 1 负载增幅与规格四件套的实际拦截效果
- 变更记录机制首次产生真实登记后,评估是否回填新的自查清单条目
- (已安装副本同步)仓库内技能更新后,需重新复制或软链到 pi 技能目录方可在会话中生效

## 阻塞

无。

## 最近验证

- 2026-09-09 全包交叉引用一致性检查:旧引用(「design.md 测试策略节」)已清零;spec.md/design-checklist 引用链完整;plan-template 任务详情节无残留重复行(人工核对通过,本包为纯 Markdown,无自动化测试)

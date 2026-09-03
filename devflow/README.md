# devflow — 个人开发工作流(pi 技能包)

由 mattpocock/skills 与 obra/superpowers 蒸馏而成的个人 AI 编码工作流。
设计定稿见 `../analysis/03-distilled-workflow-design.md`。

**一句话**:一个 `/dev` 命令走天下——内部分类器路由轻/重流程,三道门(设计→计划→最终)守住方向、路径、结果,门之间 agent 挂机自治,一切状态落盘在 git 里的文档中。

## 结构

```
skills/                    # 技能:工作流逻辑
├── dev/                   # 主入口:分类器 + 轻流程 + 重流程 + 回退协议
│   └── references/        #   设计文档模板、计划文档模板
├── dev-doc/               # 知识沉淀(CONTEXT.md + ADR)
├── dev-resume/            # 中断恢复协议
├── dev-review/            # 代码库巡检
├── grilling/              # 纪律:访谈原语(设计树/轮次/前沿)
├── domain-docs/           # 纪律:词汇表 + ADR 维护
├── tdd/                   # 纪律:红绿循环 + 豁免白名单
├── code-review/           # 纪律:子代理评审 + 分级处置
│   └── references/        #   评审子代理派发模板
├── debugging/             # 纪律:根因先行诊断
└── verification/          # 纪律:证据先于声称

prompts/                   # 命令:固定入口
├── dev.md                  # → /dev <任务描述>
├── dev-doc.md              # → /dev-doc [术语/决策]
├── dev-resume.md           # → /dev-resume [计划]
└── dev-review.md           # → /dev-review [范围]
```

## 安装

把 `skills/` 下的目录复制(或软链)到 pi 的技能目录,`prompts/` 下的文件复制到 pi 的提示词模板目录:

```bash
# 全局安装(所有项目可用)
cp -r skills/* ~/.pi/agent/skills/
cp -r prompts/* ~/.pi/agent/prompts/

# 或项目级安装(在目标仓库根目录)
mkdir -p .pi/skills .pi/prompts
cp -r skills/* .pi/skills/
cp -r prompts/* .pi/prompts/
```

也可以在 pi 设置中直接指向本目录(settings.json):

```json
{ "skills": ["D:/test/pi-workflow/devflow/skills"], "prompts": ["D:/test/pi-workflow/devflow/prompts"] }
```

重启 pi 后,输入 `/` 应能看到 `dev`、`dev-doc`、`dev-resume`、`dev-review` 四个命令。

## 使用

### 日常开发

```
/dev 给项目加团队邀请功能        ← 重流程:访谈→设计文档(门1)→计划(门2)→逐任务开发→最终确认(门3)
/dev 修复导出时的报错           ← 轻流程:直接修(根因先行),汇报后提交
/dev-resume                     ← 中断后续命
```

### 重流程中你只需要在三个点出现

1. **门 1**:访谈结束后确认设计文档(`docs/plans/<日期>-<特性>/design.md`)
2. **门 2**:确认开发计划(plan.md,含任务拆分)
3. **门 3**:验收最终报告

门之间的开发阶段 agent 自治:逐任务 TDD → 子代理评审 → 提交 → 勾选进度;只有 Critical 问题才会暂停问你。

### 知识与维护

```
/dev-doc                        ← 把会话里刚聊定的术语/决策落盘
/dev-review                     ← 定期巡检,产出架构深化候选
```

## 设计取舍速览

| 决策 | 选择 | 理由 |
|---|---|---|
| 触发方式 | 命令启动,无上下文注入 | 个人使用,拒绝流程感重的自动接管;状态落盘使注入不再必要 |
| 执行引擎 | 会话内执行 + 子代理评审 | 中小特性为主,流水线隔离收益不抵开销;评审独立性必须保住 |
| TDD | 默认制 + 豁免白名单留痕 | 亲眼看红是核心;纯配置/文案豁免防磨人 |
| 门密度 | 轻流程零门;重流程三门 | 人在决策处出现,在执行处消失 |
| 回退 | 文档阶段零成本;开发阶段按 commit 精确切除 | 每任务一提交使爆炸半径可计算 |

## 维护说明

- 修改技能后无需重启 pi 以外的操作;技能在会话启动时重新扫描。
- `dev/SKILL.md` 与 `references/` 模板、`code-review/references/reviewer-prompt.md` 是流程契约,改动需同步更新 `../analysis/03-distilled-workflow-design.md`。
- 留档未实现(升级路径):子代理流水线执行器(大型任务)、triage、wayfinder、并行排查、per-repo setup。

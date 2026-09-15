# devflow — 个人开发工作流(pi 技能包)

由 mattpocock/skills 与 obra/superpowers 蒸馏而成的个人 AI 编码工作流。
设计定稿见 `../analysis/03-distilled-workflow-design.md`。

**一句话**:一个 `/dev` 命令走天下——内部分类器路由轻/重/巨流程,三道门(设计→计划→最终)守住方向、路径、结果,门之间 agent 挂机自治,一切状态落盘在 git 里的文档中;判为"巨"的需求先走 `/dev-map` 决策地图分批探路,雾散后再回到 `/dev`。

## 结构

```
skills/                    # 技能:工作流逻辑
├── dev/                   # 主入口:分类器 + 轻流程 + 重流程 + 回退协议
│   └── references/        #   设计模板(design)、规格模板(spec)、自查清单、计划模板
├── dev-doc/               # 知识沉淀(CONTEXT.md + ADR)
├── dev-resume/            # 中断恢复协议
├── dev-review/            # 代码库巡检
├── dev-map/               # 巨型需求的决策地图:目的地/雾/票/越界,产决策不产代码
│   └── references/        #   地图模板(map)
├── grilling/              # 纪律:访谈原语(设计树/轮次/前沿)
├── domain-docs/           # 纪律:词汇表 + ADR 维护
├── tdd/                   # 纪律:红绿循环 + 豁免白名单
├── code-review/           # 纪律:子代理评审 + 分级处置
│   └── references/        #   评审派发模板 + 复审专用模板
├── debugging/             # 纪律:根因先行诊断
└── verification/          # 纪律:证据先于声称

prompts/                   # 命令:固定入口
├── dev.md                  # → /dev <任务描述>
├── dev-doc.md              # → /dev-doc [术语/决策]
├── dev-resume.md           # → /dev-resume [计划]
├── dev-review.md           # → /dev-review [范围]
└── dev-map.md              # → /dev-map <需求描述>
```

## 安装

**首选:pi 包方式**(仓库根 package.json 已声明 pi 清单):

```bash
pi install git:github.com/GuangAD/devflow@v2.0.0   # 全局,锚定 ref
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
/dev 给项目加团队邀请功能        ← 重流程:访谈→设计+规格骨架(门1)→用例详版+计划(门2)→逐任务开发→最终确认(门3)
/dev 修复导出时的报错           ← 轻流程:直接修(根因先行),汇报后提交
/dev 把单租户改造成多租户        ← 巨流程:/dev-map 建地图→逐票探路→雾散后进 /dev 重流程
/dev-resume                     ← 中断后续命
```

### 重流程中你只需要在三个点出现

1. **门 1**:访谈结束后确认两份文档——design.md(决策快照)+ spec.md 骨架(接口规格四件套+钉住用例+接口面穷举清单)
2. **门 2**:确认 spec.md 用例详版与开发计划(plan.md,任务=接口组)
3. **门 3**:验收最终报告

门之间的开发阶段 agent 自治:逐任务 TDD → 子代理评审 → 提交 → 勾选进度;只有 Critical 问题才会暂停问你。

### 巨流程:一次谈不完的需求先建地图

判巨时 `/dev` 会路由到 `/dev-map`。它**产决策不产代码**,用一张 `docs/maps/<日期>-<slug>/map.md` 分批探路:

```
目的地(定死范围) → 雾(还说不 sharp 的) → 票(能说精确的) → 一次会话解一票 → 雾散 → 回 /dev 重流程
```

雾与票的分界判据是**你现在能不能把问题说精确**,而不是能不能回答它。地图走完后,design.md 从已定决策直接生成,访谈只补门 1 自查发现的具体空白。

它补的是重流程的一个结构性死角:门 1 要求"设计树无含糊分支",而巨大需求的开放问题短期清不空——硬进重流程只会卡在门 1 前无限访谈。

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
| 门密度 | 轻流程零门;重流程三门;巨流程先走地图层再进重流程 | 人在决策处出现,在执行处消失;巨流程把"决策"本身拆成多批 |
| 设计产物 | design.md 决策快照(冻结)+ spec.md 实现规格(演进,带变更记录) | 决策不再被开发漂移污染;接口真值有台账可溯;已知缺陷类在设计期被自查清单拦截(v2,源自 threejs-labs 实证回顾) |
| 回退 | 文档阶段零成本;开发阶段按 commit 精确切除 | 每任务一提交使爆炸半径可计算 |

## 维护说明

- 修改技能后无需重启 pi 以外的操作;技能在会话启动时重新扫描。
- `dev/SKILL.md` 与 `references/` 模板、`code-review/references/`(评审派发 + 复审模板)是流程契约,改动需同步更新 `../analysis/03-distilled-workflow-design.md`。
- 评审子代理:直接用 pi-subagents 内置 `reviewer`,不做本地副本或覆盖,保持上游同步;复审降思考档在派发时指定(model 后缀),不用本地 agent 覆盖。
- 留档未实现(升级路径):子代理流水线执行器(大型任务)、triage、并行排查、per-repo setup。

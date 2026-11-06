# devflow — pi 个人开发工作流包

一个 `/dev` 命令走天下的个人 AI 编码工作流：接到需求先看再判，能直接做就直接做；要设计就写需求文档（门 1），切完片、写完技术规格与全部任务契约再停一次（门 2），然后逐任务自治开发，最后门 3 验收。三道门守方向、路径、结果，门之间 agent 挂机自治。内置 TDD 红绿循环、subagent 独立评审、证据先于声称等纪律技能。

由 [mattpocock/skills](https://github.com/mattpocock/skills) 与 [obra/superpowers](https://github.com/obra/superpowers) 蒸馏而成，设计定稿见 [analysis/16-workflow-redesign.md](analysis/16-workflow-redesign.md)（2026-11-01 重设计，取代 `analysis/03`）。

## 安装(pi 包)

```bash
# 全局安装(锚定 ref,升级时改为新 ref 重跑)
pi install git:github.com/GuangAD/devflow@v4.1.1

# 或项目级安装(写入 .pi/settings.json,团队共享)
pi install -l git:github.com/GuangAD/devflow

# 本地开发本包时:直接指向工作副本,不复制,改完新会话即生效
pi install -l <本仓库路径>

# 试用不安装(当前会话临时加载)
pi -e git:github.com/GuangAD/devflow
```

安装后重启 pi，输入 `/` 应能看到 `dev`、`dev-doc`、`dev-resume`、`dev-review` 四个命令。

## 提供的资源

- **命令**：dev（主入口）/ dev-doc（知识沉淀）/ dev-resume（断点续做）/ dev-review（代码库巡检）
- **纪律技能**：grilling（整轮访谈原语）、tdd（红绿循环 + waiver 留痕 + mutation check）、code-review（subagent 评审 + 分级处置）、debugging（根因先行）、verification（证据先于声称）、domain-docs（词汇表 + ADR）等 11 项
- **模板与派发**：`dev/references/` 下 intake、brief、slice、tech-spec、task-spec 五份模板，十条自查清单，以及 implementer 派发模板
- **扩展**：context-meter（注册只读工具 `context_usage` 读上下文占比；只报数、不判阈值，阈值写在 dev 技能里；不注入任何消息，零运行时依赖）
- **自检**：`devflow/tests/skill-check.sh`（技能文档字节上限、引用完整、无旧概念残留）

## 文档

- 使用说明与设计取舍：[devflow/README.md](devflow/README.md)
- 进度与变更记录：[devflow/ROADMAP.md](devflow/ROADMAP.md)
- 流程设计定稿（实施唯一依据）：[analysis/16-workflow-redesign.md](analysis/16-workflow-redesign.md)
- 重设计讨论全过程：[analysis/15-workflow-redesign-discussion.md](analysis/15-workflow-redesign-discussion.md)
- 领域词汇表（术语在本项目里指什么）：[CONTEXT.md](CONTEXT.md)
- 架构决策记录（当初为什么不用另一种做法）：[docs/adr/](docs/adr/)

## 许可

MIT。贴图与上游来源的署名见各来源仓库原始许可。

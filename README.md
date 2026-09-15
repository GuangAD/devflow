# devflow — pi 个人开发工作流包

一个 `/dev` 命令走天下的个人 AI 编码工作流:内部分类器路由轻/重/巨流程,三道门(设计→计划→最终)守住方向、路径、结果,门之间 agent 挂机自治;判巨的需求先走 `/dev-map` 决策地图分批探路。内置 TDD 红绿循环、子代理独立评审、证据先于声称等纪律技能。

由 [mattpocock/skills](https://github.com/mattpocock/skills) 与 [obra/superpowers](https://github.com/obra/superpowers) 蒸馏而成,设计定稿见 [analysis/03-distilled-workflow-design.md](analysis/03-distilled-workflow-design.md)。

## 安装(pi 包)

```bash
# 全局安装(锚定 ref,升级时改为新 ref 重跑)
pi install git:github.com/GuangAD/devflow@v2.0.0

# 或项目级安装(写入 .pi/settings.json,团队共享)
pi install -l git:github.com/GuangAD/devflow

# 试用不安装(当前会话临时加载)
pi -e git:github.com/GuangAD/devflow
```

安装后重启 pi,输入 `/` 应能看到 `dev`、`dev-doc`、`dev-resume`、`dev-review`、`dev-map` 五个命令。

## 提供的资源

- **命令**:dev(主入口,分类器)/ dev-map(巨型需求的决策地图)/ dev-doc(知识沉淀)/ dev-resume(断点续做)/ dev-review(代码库巡检)
- **纪律技能**:grilling(访谈)、tdd(红绿循环+豁免留痕+反向验证)、code-review(子代理评审+分级处置)、debugging(根因先行)、verification(证据先于声称)、domain-docs(词汇表+ADR)等 11 项

## 文档

- 使用说明与设计取舍:[devflow/README.md](devflow/README.md)
- 进度与变更记录:[devflow/ROADMAP.md](devflow/ROADMAP.md)
- 流程设计定稿(实施唯一依据):[analysis/03-distilled-workflow-design.md](analysis/03-distilled-workflow-design.md)

## 许可

MIT。贴图与上游来源的署名见各来源仓库原始许可。

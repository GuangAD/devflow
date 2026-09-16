---
name: dev-map
description: 决策地图:为模糊且巨大的需求分批探路,一次会话解一张 ticket(票),产出决策而非代码,fog(雾)散尽后汇入 /dev 重流程(heavy track)。仅当用户显式调用 /dev-map,或经 /dev classifier(分类器)判为巨流程(huge track)时使用。
---

# dev-map — 决策地图

前提认知:**地图产决策,不产代码;产代码是 /dev 的事。** 一个需求大到一次访谈装不下、且有些区域连问题都还说不出 sharp 时,直接进 /dev 会被门 1 的自查红线卡死——那条红线是"开放问题非空不得呈报",而巨大需求的本质恰恰是开放问题短期清不空。地图层就是为了让"说不清的 fog"变成"已定决策"而存在。

## 什么时候不该用

- design tree 一轮能收、没有说不出 sharp 的区域 → 这是"重"不是"巨",直接 /dev。
- 建地图的第一次广度扫描**没扫出任何 fog** → 停下告诉用户不需要地图,问他怎么走(进 /dev 重流程,还是就地聊完)。

## 地图

地图是单个 Markdown 文件 `docs/maps/<YYYY-MM-DD>-<slug>/map.md`,进 git。它是**索引不是仓库**:每条决策只存在它自己的 ticket 里,地图只存一行 gist,不复述结论。

按 [references/map-template.md](references/map-template.md) 创建,五节:destination / 备注 / 已定决策 / fog / out of scope。

**destination 先定。** destination 定死范围,out of scope 的关掉。它一两行,每个会话开工前先读它再选 ticket——它决定这张 ticket 该不该存在。

## ticket

ticket 是 map.md 里的条目,一行一张,状态用 checkbox,解完回填 commit 哈希(与 plan.md 同一套记账法)。ticket 的问题全文与结论写在条目下方。

四种类型,标注在 ticket 名后:

- **调研**(AFK):查文档、第三方 API 或代码库才能拿到的事实,某个决策正等它。派 subagent 干,不占用户。
- **原型**(HITL):把讨论的保真度提上去——一个粗糙但具体的东西让人反应。用于"它该长什么样/该怎么表现"才是关键问题时。
- **访谈**(HITL):默认类型。调 grilling + domain-docs。**agent 不许替用户回答自己的问题**——自己问自己答的访谈已经坏了。
- **任务**(HITL 或 AFK):本身不是决策,但某个决策被它堵住——注册一个服务才能评判它的 API,搬一次数据才看得见形状。它靠"解锁某个决策"挣到位置,不是靠交付 destination。

## fog

地图**故意不完整**:能看清多远画多远。

**fog 还是 ticket?判据是:你现在能不能把这个问题说精确,而不是你现在能不能回答它。**

- 能说精确 → 开 ticket,哪怕它还被别的 ticket 阻塞着、眼下动不了。
- 还不能说 sharp → 留在 fog 里。**别把 fog 预先切成 ticket 大小的块**:fog 比 ticket 粗,一块 fog 等 frontier 推到它时可能毕业成几张 ticket,也可能一张都不成。

解完一张 ticket 会照亮它前面的 fog 一块;毕业出来的新 ticket 当场开出来,并把那块 fog 从「fog」节清掉——同一件事只活在一个地方。

## out of scope

fog 只朝 destination 聚。超出 destination 的不是 fog,归「out of scope」节:这次明确不做的。out of scope 的永不毕业,除非 destination 被重画——那时它是新的一次努力,不是续集。

已经开的 ticket 若被发现其实在 destination 之外(建图时划错,或被某个结论照出来),**关掉它**(关掉的 ticket 确定不在 frontier 上),在「out of scope」节留一行 gist 加原因并链过去。它不进「已定决策」——那是记录实际走过的路,范围边界不是路上的一步。

## 调用

两种模式。**每会话最多解一张 ticket**,调研 ticket 除外(可并行)。

### 建地图

1. **定 destination**:调 grilling + domain-docs,钉死这张图要走到哪——一份规格、一个要先锁的决定,还是一次就地改造。destination 定范围,所以它先定。
2. **扫 frontier**:再访谈一轮,这次**广度优先**——在整个空间上铺开,不在任何一条线上钻深,把现在能动的决策和第一步浮出来。没扫出 fog 就按上面「什么时候不该用」停下。
3. **建地图**:destination 与备注填好,已定决策空着,fog 描进「fog」节。
4. **开现在能说精确的 ticket**,再**第二遍**接依赖(ticket 得先有编号才能互相引用)。接完就分出 frontier 与被阻塞的;说不清的留在 fog 里。
5. **放调研 subagent**:每张调研 ticket 派一个 subagent 去解,结论记回 ticket 上。
6. 停:建图是一个会话的活,不现场解任何 ticket。

### 走地图

1. 读 map.md(低分辨率视图,不是所有 ticket 的详细内容)。
2. 选 ticket:用户点名就用它,否则取 frontier 第一张。**先认领再动手**——把该 ticket 标为进行中。
3. 解它。需要时再拉相关 ticket 的详情;拿不准就调 grilling + domain-docs。
4. 记结论:勾选该 ticket、把答案 gist 写进「已定决策」节、提交并回填 commit 哈希。
5. 补 ticket:新浮出来的开 ticket;被照亮的 fog 毕业成 ticket 并从 fog 节清掉;若某张 ticket 被发现在 destination 之外,按「out of scope」处理;若这个结论让地图别处失效,更新或删掉那些 ticket。

**认领是 git fallback 版**:没有 tracker 的 assignee,靠"每会话一 ticket + 解完即提交"防并发撞车。多个会话并行时各自挑不同的 ticket,开工前先看一眼地图有没有被别人改过。

## 出口

**fog 散尽、frontier 空了,地图就走完了。** 此时把「已定决策」全部汇总,进 /dev 走重流程:design.md 从已定决策直接生成,访谈只补门 1 自查发现的具体空白。

地图留在 `docs/maps/` 不删:destination 与 out of scope 的取舍是"当时为什么这么定"的第一手证据。

## 纪律

- 地图不改代码。想动手的冲动通常是信号:你已经走到地图边缘,该交接给 /dev 了。
- 提到 ticket 就说名字,不说编号:一面墙的 `#42 #43` 读不了。
- 已定决策只可被取代、不可就地修改(同 ADR):被推翻时在「已定决策」追加一行并注明取代了哪一行,保留完整推理链。
- 全程同时执行 domain-docs 技能:术语当场写入 CONTEXT.md,够格的决策当场写 ADR。

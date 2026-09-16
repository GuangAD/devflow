/**
 * devflow context meter — 上下文占比读数(devflow 唯一的扩展)
 *
 * 形态:**注册一个只读工具,不注入任何消息**。
 *
 * 为什么不用 `context` 钩子注入:pi 把 prompt cache 的 message 级断点放在
 * 「最后一条 user/assistant/tool-result 文本内容」上(见 pi 文档 models.md 的
 * cacheControlFormat 说明)。任何追加在末尾的常驻读数都会**占据断点位置**,
 * 使下一轮请求在该位置失配,缓存条目「历史 + 读数行」不再是新请求的前缀,
 * 整段历史就此命中不了。改成工具后,读数只在被调用时以工具结果形式进上下文,
 * 而那些位置本来就会被新内容顶掉,缓存不受影响。
 *
 * 单一职责:**只报数,不判断**。占比是否超标、超标后怎么办,全部由 dev 技能
 * 「上下文预算」节决定——那是活的契约,改阈值不需要动代码、不需要重装包。
 *
 * 数据来源:ctx.getContextUsage()(pi 官方接口,与 TUI footer 同源)。
 *   tokens 优先取最后一条 assistant 消息的真实 usage(即上次请求的 prompt 实际大小),
 *   其后新增的消息由 pi 用 chars/4 估算补齐;contextWindow 取当前模型的实际窗口。
 *
 * 依赖:无运行时依赖。`parameters` 需要的是 TypeBox schema,而 TypeBox schema 本身就是
 * 普通 JSON Schema 对象,因此直接写字面量、并只以 `import type` 引用类型——`import type`
 * 会被擦除,扩展在运行时**零 import**(与 superpowers 扩展同样的可移植做法)。
 * 早先版本 `import { Type } from "typebox"` 在仓库内解析不到该包(它只在 pi 自己的依赖树里),
 * 会使扩展加载即失败。
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { TSchema } from "typebox";

const TOOL_NAME = "context_usage";

/** 无参数工具的空 schema。TypeBox 的 schema 即 JSON Schema,无需引入其构建器。 */
const NO_PARAMS = {
	type: "object",
	properties: {},
	additionalProperties: false,
} as unknown as TSchema;

type Usage = { tokens?: number | null; contextWindow?: number };

function fmt(n: number): string {
	return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
}

export default function devflowContextMeter(pi: ExtensionAPI) {
	pi.registerTool({
		name: TOOL_NAME,
		label: "Context Usage",
		description:
			"读取当前会话的上下文占比(供 dev 工作流在任务边界判断是否需要换会话)",
		promptSnippet: "读取当前上下文占比",
		promptGuidelines: [
			`在 dev 工作流的阶段 3,每个任务提交后调用 ${TOOL_NAME} 读取上下文占比;` +
				`阈值与处置见 dev 技能的「上下文预算」节。`,
		],
		parameters: NO_PARAMS,

		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const readUsage = (ctx as { getContextUsage?: () => Usage | undefined } | undefined)
				?.getContextUsage;
			const usage = typeof readUsage === "function" ? readUsage.call(ctx) : undefined;

			const tokens = usage?.tokens ?? null;
			const window = usage?.contextWindow ?? null;

			if (tokens === null || window === null || window <= 0) {
				return {
					content: [
						{
							type: "text" as const,
							text:
								"上下文占比:读数不可用(刚压缩完、下一次响应尚未回来时属正常)。" +
								"稍后重试,或退回 dev 技能「上下文预算」节的三条可数信号。",
						},
					],
				};
			}

			const percent = Math.round((tokens / window) * 100);
			return {
				content: [
					{ type: "text" as const, text: `上下文占比 ${percent}%(${fmt(tokens)}/${fmt(window)})` },
				],
			};
		},
	});
}

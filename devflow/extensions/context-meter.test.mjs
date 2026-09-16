/**
 * context-meter 扩展测试。
 *
 * devflow 其余产物是 Markdown,靠人工核对即可;扩展是代码,需要可重跑的回归网。
 * 运行:
 *   node --experimental-strip-types devflow/extensions/context-meter.test.mjs
 *
 * 零依赖(pi 的 typebox 仅在扩展内部使用,测试只调用注册进来的定义)。
 */
const mod = await import("./context-meter.ts");

let failed = 0;
const check = (ok, label) => {
	console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
	if (!ok) failed += 1;
};

// 假 pi:记录注册了什么,并捕获是否注册过事件钩子
const registered = {};
const hooks = [];
mod.default({
	registerTool: (def) => {
		registered.tool = def;
	},
	on: (event) => {
		hooks.push(event);
	},
});

const tool = registered.tool;
check(tool?.name === "context_usage", "注册了名为 context_usage 的工具");
check(typeof tool?.execute === "function", "工具提供 execute");
check(tool?.parameters != null, "工具声明了参数 schema");
check(typeof tool?.description === "string" && tool.description.length > 0, "工具带 description");
check(Array.isArray(tool?.promptGuidelines) && /context_usage/.test(tool.promptGuidelines.join(" ")),
	"promptGuidelines 中明确点名了工具(pi 要求如此)");

// 关键:不注册任何事件钩子 —— 这是不注入、不影响 prompt cache 的结构性保证
check(hooks.length === 0, "未注册任何事件钩子(因而不注入消息、不占用缓存断点)");

const ctxWith = (usage) => ({ getContextUsage: () => usage });
const read = async (usage, ctx = ctxWith(usage)) => {
	const result = await tool.execute("call_1", {}, undefined, undefined, ctx);
	return result.content[0].text;
};

check(/10%/.test(await read({ tokens: 100, contextWindow: 1000 })), "低占比照实报出(不做阈值判断)");
check(/80%/.test(await read({ tokens: 800, contextWindow: 1000 })), "高占比照实报出");
check(/\(100\/1k\)/.test(await read({ tokens: 100, contextWindow: 1000 })), "报数含绝对量与窗口");

check(/读数不可用/.test(await read(undefined)), "getContextUsage 返回 undefined 时报读数不可用");
check(/读数不可用/.test(await read({ tokens: null, contextWindow: 1000 })), "tokens 为 null 时报读数不可用");
check(/读数不可用/.test(await read(null, undefined)), "环境不提供 ctx 时不抛错,报读数不可用");
check(/读数不可用/.test(await read({ tokens: 800, contextWindow: 0 })), "窗口为 0 时不除零,报读数不可用");

// contextWindow 取自模型而非写死:同样 tokens 换个窗口就换个百分比
check(/10%/.test(await read({ tokens: 800, contextWindow: 8000 })), "窗口变大时同样 tokens 占比下降");

console.log(failed === 0 ? "\n全部通过" : `\n${failed} 项失败`);
process.exit(failed === 0 ? 0 : 1);

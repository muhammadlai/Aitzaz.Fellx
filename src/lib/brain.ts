import { recall } from "./search";
import { uid } from "./ids";
import type { Agent, AppId, MemoryKind, MemoryRecord, Workflow } from "./types";

export interface BrainContext {
  memories: MemoryRecord[];
  agents: Agent[];
  workflows: Workflow[];
  metrics: { pulse: number; heat: number; memoryLoad: number; swarm: number; uptime: number };
}

export interface BrainAction {
  type:
    | "remember"
    | "dispatch"
    | "run_workflow"
    | "open_app"
    | "scan_tab"
    | "none";
  payload?: Record<string, string>;
}

export interface BrainReply {
  text: string;
  traces: string[];
  tools: string[];
  actions: BrainAction[];
}

const APP_WORDS: Record<string, AppId> = {
  cortex: "cortex",
  chat: "cortex",
  swarm: "swarm",
  agent: "swarm",
  vault: "vault",
  memory: "vault",
  forge: "forge",
  workflow: "forge",
  spectre: "spectre",
  browser: "spectre",
  pulse: "pulse",
  health: "pulse",
};

function pickApp(text: string): AppId | null {
  const t = text.toLowerCase();
  for (const [k, v] of Object.entries(APP_WORDS)) {
    if (t.includes(k)) return v;
  }
  return null;
}

function kindFrom(text: string): MemoryKind {
  const t = text.toLowerCase();
  if (t.includes("how") || t.includes("procedure") || t.includes("steps")) return "procedural";
  if (t.includes("is") || t.includes("define") || t.includes("charter")) return "semantic";
  return "episodic";
}

export function think(input: string, ctx: BrainContext): BrainReply {
  const q = input.trim();
  const low = q.toLowerCase();
  const traces: string[] = [];
  const tools: string[] = [];
  const actions: BrainAction[] = [];

  traces.push("Cortex parsed intent on the local kernel.");
  const hits = recall(q, ctx.memories);
  if (hits.length) {
    traces.push(`Vault returned ${hits.length} nearby traces.`);
    tools.push("vault.recall");
  }

  if (/^(hi|hello|hey|salam|salaam|yo)\b/.test(low) || low === "help") {
    return {
      traces,
      tools,
      actions,
      text: "Fellx is landed. I can hunt a question, file a memory, wake an agent, or run a forge workflow. Try “remember that…” or “run morning land”.",
    };
  }

  if (low.includes("status") || low.includes("health") || low.includes("pulse") || low.includes("kernel")) {
    tools.push("pulse.sample");
    actions.push({ type: "open_app", payload: { app: "pulse" } });
    return {
      traces: [...traces, "Pulse sampled heat, fabric, and swarm."],
      tools,
      actions,
      text: `Kernel is quiet. Pulse ${ctx.metrics.pulse}% · heat ${ctx.metrics.heat}% · vault load ${ctx.metrics.memoryLoad}% · swarm ${ctx.metrics.swarm} awake · uptime ${Math.floor(ctx.metrics.uptime / 1000)}s.`,
    };
  }

  const rememberMatch = low.match(/^(remember|file|note|save)\b[:\s]+(.+)/);
  if (rememberMatch) {
    const body = q.replace(/^(remember|file|note|save)\b[:\s]+/i, "");
    tools.push("vault.write");
    actions.push({
      type: "remember",
      payload: { title: body.slice(0, 48), body, kind: kindFrom(body) },
    });
    return {
      traces: [...traces, "Sable queued a vault write."],
      tools,
      actions,
      text: `Filed. I’ll keep “${body.slice(0, 72)}${body.length > 72 ? "…" : ""}” in the vault.`,
    };
  }

  const dispatchMatch = low.match(/\b(iris|milo|nyx|sable|orion)\b/);
  if (
    dispatchMatch &&
    (low.includes("ask") || low.includes("send") || low.includes("wake") || low.includes("dispatch") || low.includes("tell"))
  ) {
    const name = dispatchMatch[1]!;
    const agent = ctx.agents.find((a) => a.name.toLowerCase() === name);
    const task = q.replace(/^.*\b(to|that)\b/i, "").trim() || q;
    tools.push("swarm.dispatch");
    actions.push({ type: "dispatch", payload: { name, task } });
    actions.push({ type: "open_app", payload: { app: "swarm" } });
    return {
      traces: [...traces, `${agent?.name ?? name} accepted a hunt.`],
      tools,
      actions,
      text: `${agent?.name ?? name} is padding out. Task: ${task.slice(0, 140)}. Watch Swarm for the landing.`,
    };
  }

  if (low.includes("dispatch") || low.includes("wake agent") || low.includes("spawn")) {
    const task = q.replace(/.*(dispatch|wake agent|spawn)\s*/i, "").trim() || q;
    const hunter = ctx.agents.find((a) => a.role === "researcher") ?? ctx.agents[0];
    tools.push("swarm.dispatch");
    actions.push({ type: "dispatch", payload: { name: hunter.name, task } });
    actions.push({ type: "open_app", payload: { app: "swarm" } });
    return {
      traces: [...traces, `${hunter.name} drawn from idle pool.`],
      tools,
      actions,
      text: `${hunter.name} took the hunt. I’ll keep the desk clear until they land.`,
    };
  }

  const wf = ctx.workflows.find((w) => low.includes(w.name.toLowerCase()) || low.includes(w.id));
  if (low.includes("run") || low.includes("start workflow") || low.includes("forge")) {
    const chosen = wf ?? ctx.workflows[0];
    tools.push("forge.run");
    actions.push({ type: "run_workflow", payload: { id: chosen.id } });
    actions.push({ type: "open_app", payload: { app: "forge" } });
    return {
      traces: [...traces, `Forge armed “${chosen.name}”.`],
      tools,
      actions,
      text: `Running ${chosen.name}. ${chosen.summary}`,
    };
  }

  if (low.includes("open") || low.includes("show") || low.includes("launch")) {
    const app = pickApp(low) ?? "cortex";
    actions.push({ type: "open_app", payload: { app } });
    return {
      traces: [...traces, `Desk raised ${app}.`],
      tools: ["desk.open"],
      actions,
      text: `Opening ${app}.`,
    };
  }

  if (low.includes("scan") || low.includes("browse") || low.includes("spectre")) {
    actions.push({ type: "scan_tab" });
    actions.push({ type: "open_app", payload: { app: "spectre" } });
    tools.push("spectre.scan");
    return {
      traces: [...traces, "Spectre walked the captured lane."],
      tools,
      actions,
      text: "Spectre is scanning the open pages. I’ll file anything that smells useful.",
    };
  }

  if (low.includes("who are you") || low.includes("what are you") || low.includes("fellx")) {
    const charter = hits[0];
    return {
      traces,
      tools,
      actions,
      text: charter
        ? `${charter.body} I run entirely on this desk unless you wire a model later.`
        : "I’m Fellx — Aitzaz’s local autonomous OS. Quiet kernel, five agents, a vault, a forge.",
    };
  }

  const cited = hits
    .map((h) => `· ${h.title} — ${h.body}`)
    .join("\n");

  traces.push("Reasoned from vault + live metrics; no remote model.");
  return {
    traces,
    tools: hits.length ? tools : [...tools, "cortex.compose"],
    actions,
    text: hits.length
      ? `I landed on this:\n\n${cited}\n\nIf you want it acted on, say run a workflow or dispatch Iris.`
      : `No close vault hit for “${q.slice(0, 80)}”. I can remember it, hunt it with Iris, or run Deep hunt.`,
  };
}

export function streamChunks(text: string): string[] {
  const words = text.split(/(\s+)/);
  const chunks: string[] = [];
  let buf = "";
  for (const w of words) {
    buf += w;
    if (buf.length > 18) {
      chunks.push(buf);
      buf = "";
    }
  }
  if (buf) chunks.push(buf);
  return chunks.length ? chunks : [text];
}

export function newMemory(partial: { title: string; body: string; kind?: string }): MemoryRecord {
  return {
    id: uid("mem"),
    kind: (partial.kind as MemoryKind) || "episodic",
    title: partial.title || partial.body.slice(0, 40),
    body: partial.body,
    tags: ["filed", "cortex"],
    createdAt: Date.now(),
    strength: 0.7,
  };
}

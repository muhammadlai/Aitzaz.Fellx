import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { seedAgents, seedMemories, seedTabs, seedWorkflows } from "../data/seed";
import { newMemory, think } from "../lib/brain";
import { uid } from "../lib/ids";
import { saveJson } from "../lib/storage";
import type {
  Agent,
  AppId,
  ChatMessage,
  KernelEvent,
  Metrics,
  OsSnapshot,
  WindowState,
} from "../lib/types";

const APP_META: Record<AppId, { title: string; w: number; h: number }> = {
  cortex: { title: "Cortex", w: 760, h: 560 },
  swarm: { title: "Swarm", w: 780, h: 520 },
  vault: { title: "Vault", w: 720, h: 520 },
  forge: { title: "Forge", w: 760, h: 500 },
  spectre: { title: "Spectre", w: 800, h: 540 },
  pulse: { title: "Pulse", w: 720, h: 500 },
};

const initial: OsSnapshot = {
  kernel: "offline",
  bootedAt: null,
  metrics: { pulse: 12, heat: 18, memoryLoad: 22, swarm: 0, uptime: 0 },
  memories: seedMemories,
  agents: seedAgents,
  workflows: seedWorkflows,
  messages: [
    {
      id: "m0",
      role: "system",
      text: "Local cortex online. No remote model is wired — Fellx reasons on-desk.",
      at: Date.now(),
    },
  ],
  events: [],
  tabs: seedTabs,
  windows: [],
  activeApp: null,
  notices: [],
};

type Action =
  | { type: "BOOT_START" }
  | { type: "BOOT_READY" }
  | { type: "TICK" }
  | { type: "LOG"; level: KernelEvent["level"]; source: string; message: string }
  | { type: "OPEN"; app: AppId }
  | { type: "FOCUS"; id: string }
  | { type: "MOVE"; id: string; x: number; y: number }
  | { type: "MIN"; id: string }
  | { type: "MAX"; id: string }
  | { type: "CLOSE"; id: string }
  | { type: "USER"; text: string }
  | { type: "ASSIST"; msg: ChatMessage }
  | { type: "REMEMBER"; title: string; body: string; kind?: string }
  | { type: "DISPATCH"; name: string; task: string }
  | { type: "AGENT_LAND"; id: string; note: string }
  | { type: "RUN_WF"; id: string }
  | { type: "WF_STEP"; id: string }
  | { type: "SCAN" }
  | { type: "NOTICE"; text: string }
  | { type: "CLEAR_NOTICE" }
  | { type: "RESET" };

function pushEvent(
  events: KernelEvent[],
  level: KernelEvent["level"],
  source: string,
  message: string,
): KernelEvent[] {
  return [
    { id: uid("ev"), at: Date.now(), level, source, message },
    ...events,
  ].slice(0, 80);
}

function nextZ(windows: WindowState[]) {
  return windows.reduce((m, w) => Math.max(m, w.z), 10) + 1;
}

function jitter(n: number, lo: number, hi: number, step = 4) {
  const v = n + (Math.random() * step * 2 - step);
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

function reduce(state: OsSnapshot, action: Action): OsSnapshot {
  switch (action.type) {
    case "BOOT_START":
      return {
        ...state,
        kernel: "booting",
        events: pushEvent(state.events, "info", "kernel", "Boot sequence armed."),
      };
    case "BOOT_READY":
      return {
        ...state,
        kernel: "ready",
        bootedAt: Date.now(),
        notices: ["Fellx landed. Kernel is quiet."],
        events: pushEvent(state.events, "ok", "kernel", "Ready. Desk is live."),
      };
    case "TICK": {
      if (state.kernel !== "ready") return state;
      const uptime = state.bootedAt ? Date.now() - state.bootedAt : 0;
      const hunting = state.agents.filter((a) => a.status === "hunting").length;
      const metrics: Metrics = {
        pulse: jitter(state.metrics.pulse, 18, 86, 3),
        heat: jitter(state.metrics.heat + hunting * 2, 14, 78, 2),
        memoryLoad: Math.min(96, 18 + state.memories.length * 6),
        swarm: hunting,
        uptime,
      };
      const agents = state.agents.map((a) =>
        a.status === "idle" && Math.random() < 0.04
          ? { ...a, lastBeat: Date.now(), cycles: a.cycles + 1 }
          : { ...a, lastBeat: a.status === "hunting" ? Date.now() : a.lastBeat },
      );
      return { ...state, metrics, agents };
    }
    case "LOG":
      return {
        ...state,
        events: pushEvent(state.events, action.level, action.source, action.message),
      };
    case "OPEN": {
      const existing = state.windows.find((w) => w.app === action.app);
      if (existing) {
        return {
          ...state,
          activeApp: action.app,
          windows: state.windows.map((w) =>
            w.id === existing.id
              ? { ...w, minimized: false, z: nextZ(state.windows) }
              : w,
          ),
        };
      }
      const meta = APP_META[action.app];
      const i = state.windows.length;
      const win: WindowState = {
        id: uid("win"),
        app: action.app,
        title: meta.title,
        x: 56 + i * 28,
        y: 58 + i * 22,
        w: meta.w,
        h: meta.h,
        z: nextZ(state.windows),
        minimized: false,
        maximized: false,
      };
      return {
        ...state,
        activeApp: action.app,
        windows: [...state.windows, win],
        events: pushEvent(state.events, "info", "desk", `Raised ${meta.title}.`),
      };
    }
    case "FOCUS": {
      const target = state.windows.find((w) => w.id === action.id);
      return {
        ...state,
        activeApp: target?.app ?? state.activeApp,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, z: nextZ(state.windows) } : w,
        ),
      };
    }
    case "MOVE":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      };
    case "MIN":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: !w.minimized, maximized: false } : w,
        ),
      };
    case "MAX":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, maximized: !w.maximized, minimized: false } : w,
        ),
      };
    case "CLOSE":
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.id),
      };
    case "USER":
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: uid("msg"), role: "user", text: action.text, at: Date.now() },
        ],
      };
    case "ASSIST":
      return { ...state, messages: [...state.messages, action.msg] };
    case "REMEMBER": {
      const mem = newMemory(action);
      return {
        ...state,
        memories: [mem, ...state.memories],
        events: pushEvent(state.events, "ok", "vault", `Filed “${mem.title}”.`),
        notices: [`Vault sealed: ${mem.title}`],
      };
    }
    case "DISPATCH": {
      const agents: Agent[] = state.agents.map((a) =>
        a.name.toLowerCase() === action.name.toLowerCase()
          ? {
              ...a,
              status: "hunting",
              task: action.task,
              lastBeat: Date.now(),
              log: [`Hunt: ${action.task}`, ...a.log].slice(0, 8),
            }
          : a,
      );
      return {
        ...state,
        agents,
        events: pushEvent(state.events, "info", "swarm", `${action.name} dispatched.`),
        notices: [`${action.name} is hunting.`],
      };
    }
    case "AGENT_LAND":
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.id
            ? {
                ...a,
                status: "landed",
                task: null,
                cycles: a.cycles + 1,
                log: [action.note, ...a.log].slice(0, 8),
              }
            : a,
        ),
        events: pushEvent(state.events, "ok", "swarm", action.note),
        notices: [action.note],
      };
    case "RUN_WF":
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.id ? { ...w, status: "running", cursor: 0, lastRun: Date.now() } : w,
        ),
        events: pushEvent(state.events, "info", "forge", "Workflow armed."),
      };
    case "WF_STEP": {
      const wf = state.workflows.find((w) => w.id === action.id);
      if (!wf) return state;
      const next = wf.cursor + 1;
      const done = next >= wf.steps.length;
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.id
            ? { ...w, cursor: next, status: done ? "ok" : "running" }
            : w,
        ),
        events: done
          ? pushEvent(state.events, "ok", "forge", `${wf.name} landed.`)
          : state.events,
        notices: done ? [`${wf.name} complete.`] : state.notices,
      };
    }
    case "SCAN":
      return {
        ...state,
        tabs: state.tabs.map((t) => ({ ...t, status: "scanning" })),
        events: pushEvent(state.events, "info", "spectre", "Scan started."),
      };
    case "NOTICE":
      return { ...state, notices: [action.text, ...state.notices].slice(0, 4) };
    case "CLEAR_NOTICE":
      return { ...state, notices: state.notices.slice(1) };
    case "RESET":
      return { ...initial, kernel: "offline", messages: initial.messages };
    default:
      return state;
  }
}

interface OsApi extends OsSnapshot {
  boot: () => void;
  openApp: (app: AppId) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  minimize: (id: string) => void;
  maximize: (id: string) => void;
  close: (id: string) => void;
  ask: (text: string) => Promise<void>;
  remember: (title: string, body: string) => void;
  dispatch: (name: string, task: string) => void;
  runWorkflow: (id: string) => void;
  scan: () => void;
}

const OsContext = createContext<OsApi | null>(null);

export function OsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reduce, initial);
  const stateRef = useRef(state);
  stateRef.current = state;
  const timers = useRef<number[]>([]);

  useEffect(() => {
    saveJson({
      memories: state.memories,
      messages: state.messages.slice(-30),
    });
  }, [state.memories, state.messages]);

  useEffect(() => {
    const t = window.setInterval(() => dispatch({ type: "TICK" }), 1600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!state.notices.length) return;
    const t = window.setTimeout(() => dispatch({ type: "CLEAR_NOTICE" }), 3800);
    return () => clearTimeout(t);
  }, [state.notices]);

  const boot = useCallback(() => {
    dispatch({ type: "BOOT_START" });
    const lines: Array<[number, string]> = [
      [280, "Mounting brain fabric…"],
      [620, "Hydrating vault…"],
      [980, "Waking swarm…"],
      [1320, "Calibrating spectre lane…"],
      [1680, "Forge graphs warm."],
    ];
    lines.forEach(([ms, message]) => {
      const id = window.setTimeout(
        () => dispatch({ type: "LOG", level: "info", source: "boot", message }),
        ms,
      );
      timers.current.push(id);
    });
    const done = window.setTimeout(() => dispatch({ type: "BOOT_READY" }), 2100);
    timers.current.push(done);
  }, []);

  const openApp = useCallback((app: AppId) => dispatch({ type: "OPEN", app }), []);
  const focus = useCallback((id: string) => dispatch({ type: "FOCUS", id }), []);
  const move = useCallback(
    (id: string, x: number, y: number) => dispatch({ type: "MOVE", id, x, y }),
    [],
  );
  const minimize = useCallback((id: string) => dispatch({ type: "MIN", id }), []);
  const maximize = useCallback((id: string) => dispatch({ type: "MAX", id }), []);
  const close = useCallback((id: string) => dispatch({ type: "CLOSE", id }), []);

  const remember = useCallback((title: string, body: string) => {
    dispatch({ type: "REMEMBER", title, body });
  }, []);

  const dispatchAgent = useCallback((name: string, task: string) => {
    dispatch({ type: "DISPATCH", name, task });
    const agent = stateRef.current.agents.find(
      (a) => a.name.toLowerCase() === name.toLowerCase(),
    );
    if (!agent) return;
    const t = window.setTimeout(() => {
      dispatch({
        type: "AGENT_LAND",
        id: agent.id,
        note: `${agent.name} landed: ${task.slice(0, 80)}`,
      });
      if (task.toLowerCase().includes("remember") || task.length > 20) {
        dispatch({
          type: "REMEMBER",
          title: `${agent.name} field note`,
          body: `${agent.name} completed: ${task}`,
          kind: "episodic",
        });
      }
    }, 2600 + Math.random() * 1400);
    timers.current.push(t);
  }, []);

  const runWorkflow = useCallback((id: string) => {
    const wf = stateRef.current.workflows.find((w) => w.id === id);
    if (!wf) return;
    dispatch({ type: "RUN_WF", id });
    let acc = 200;
    wf.steps.forEach((step) => {
      acc += step.ms;
      const t = window.setTimeout(() => {
        dispatch({ type: "LOG", level: "info", source: "forge", message: step.detail });
        dispatch({ type: "WF_STEP", id });
      }, acc);
      timers.current.push(t);
    });
  }, []);

  const scan = useCallback(() => {
    dispatch({ type: "SCAN" });
    const t = window.setTimeout(() => {
      dispatch({
        type: "REMEMBER",
        title: "Spectre capture",
        body: "Scan complete. Kernel notes and swarm patterns remain the strongest pages.",
        kind: "semantic",
      });
      dispatch({ type: "LOG", level: "ok", source: "spectre", message: "Scan captured 3 pages." });
    }, 1800);
    timers.current.push(t);
  }, []);

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q) return;
      dispatch({ type: "USER", text: q });
      const reply = think(q, stateRef.current);
      for (const act of reply.actions) {
        if (act.type === "remember" && act.payload) {
          dispatch({
            type: "REMEMBER",
            title: act.payload.title ?? "note",
            body: act.payload.body ?? q,
            kind: act.payload.kind,
          });
        }
        if (act.type === "dispatch" && act.payload?.name) {
          dispatchAgent(act.payload.name, act.payload.task ?? q);
        }
        if (act.type === "run_workflow" && act.payload?.id) {
          runWorkflow(act.payload.id);
        }
        if (act.type === "open_app" && act.payload?.app) {
          dispatch({ type: "OPEN", app: act.payload.app as AppId });
        }
        if (act.type === "scan_tab") scan();
      }
      await new Promise((r) => setTimeout(r, 280));
      dispatch({
        type: "ASSIST",
        msg: {
          id: uid("msg"),
          role: "fellx",
          text: reply.text,
          at: Date.now(),
          traces: reply.traces,
          tools: reply.tools,
        },
      });
    },
    [dispatchAgent, runWorkflow, scan],
  );

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const api = useMemo<OsApi>(
    () => ({
      ...state,
      boot,
      openApp,
      focus,
      move,
      minimize,
      maximize,
      close,
      ask,
      remember,
      dispatch: dispatchAgent,
      runWorkflow,
      scan,
    }),
    [
      state,
      boot,
      openApp,
      focus,
      move,
      minimize,
      maximize,
      close,
      ask,
      remember,
      dispatchAgent,
      runWorkflow,
      scan,
    ],
  );

  return <OsContext.Provider value={api}>{children}</OsContext.Provider>;
}

export function useOs() {
  const ctx = useContext(OsContext);
  if (!ctx) throw new Error("useOs outside provider");
  return ctx;
}

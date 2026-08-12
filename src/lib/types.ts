export type KernelState = "offline" | "booting" | "ready" | "degraded";

export type AppId = "cortex" | "swarm" | "vault" | "forge" | "spectre" | "pulse";

export type MemoryKind = "episodic" | "semantic" | "procedural";

export type AgentRole = "researcher" | "operator" | "sentinel" | "scribe" | "architect";

export type AgentStatus = "idle" | "hunting" | "landed" | "blocked";

export type WorkflowStatus = "idle" | "running" | "ok" | "failed";

export interface MemoryRecord {
  id: string;
  kind: MemoryKind;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
  strength: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  brief: string;
  task: string | null;
  lastBeat: number;
  cycles: number;
  log: string[];
}

export interface WorkflowStep {
  id: string;
  label: string;
  detail: string;
  ms: number;
}

export interface Workflow {
  id: string;
  name: string;
  summary: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  cursor: number;
  lastRun: number | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "fellx" | "system";
  text: string;
  at: number;
  traces?: string[];
  tools?: string[];
}

export interface KernelEvent {
  id: string;
  at: number;
  level: "info" | "ok" | "warn" | "crit";
  source: string;
  message: string;
}

export interface SpectreTab {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  status: "idle" | "scanning" | "captured";
}

export interface WindowState {
  id: string;
  app: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export interface Metrics {
  pulse: number;
  heat: number;
  memoryLoad: number;
  swarm: number;
  uptime: number;
}

export interface OsSnapshot {
  kernel: KernelState;
  bootedAt: number | null;
  metrics: Metrics;
  memories: MemoryRecord[];
  agents: Agent[];
  workflows: Workflow[];
  messages: ChatMessage[];
  events: KernelEvent[];
  tabs: SpectreTab[];
  windows: WindowState[];
  activeApp: AppId | null;
  notices: string[];
}

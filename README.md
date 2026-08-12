# Aitzaz Fellx

A local-first **autonomous operating system** for the desk: a quiet kernel, a five-agent swarm, a memory vault, a workflow forge, a captured browser lane, and a live pulse.

Fellx does not call a remote model unless you wire one later. The cortex reasons on-device with vault recall, tool traces, and explicit dispatch.

## Apps

| App | Role |
| --- | --- |
| **Cortex** | Talk to the kernel. Remember, hunt, run flows. |
| **Swarm** | Iris, Milo, Nyx, Sable, Orion — dispatch and land. |
| **Vault** | Episodic / semantic / procedural fabric. |
| **Forge** | Stepwise workflows (morning land, deep hunt, compact). |
| **Spectre** | Browser theatre over captured pages. |
| **Pulse** | Heat, fabric load, event stream. |

Command palette: `⌘K` / `Ctrl+K`.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL. The Vite server binds `0.0.0.0` so preview hosts work.

```bash
npm run build
npm run preview
```

## Stack

React 19 · Vite · TypeScript · Tailwind · Framer Motion.

Kernel, vault scoring, swarm, and forge live in `src/lib` and `src/state` — the UI is a desk over a real in-browser runtime, not a painted mock.

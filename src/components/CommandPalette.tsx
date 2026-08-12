import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { AppId } from "../lib/types";
import { useOs } from "../state/OsProvider";

const COMMANDS: { id: string; label: string; hint: string; run: (os: ReturnType<typeof useOs>) => void }[] = [
  { id: "cx", label: "Open Cortex", hint: "think", run: (os) => os.openApp("cortex") },
  { id: "sw", label: "Open Swarm", hint: "agents", run: (os) => os.openApp("swarm") },
  { id: "vt", label: "Open Vault", hint: "memory", run: (os) => os.openApp("vault") },
  { id: "fg", label: "Open Forge", hint: "workflows", run: (os) => os.openApp("forge") },
  { id: "sp", label: "Open Spectre", hint: "browser", run: (os) => os.openApp("spectre") },
  { id: "pl", label: "Open Pulse", hint: "health", run: (os) => os.openApp("pulse") },
  { id: "wf", label: "Run morning land", hint: "forge", run: (os) => os.runWorkflow("wf_morning") },
  { id: "hunt", label: "Run deep hunt", hint: "forge", run: (os) => os.runWorkflow("wf_hunt") },
  {
    id: "iris",
    label: "Dispatch Iris",
    hint: "swarm",
    run: (os) => os.dispatch("Iris", "Brief the operator from the vault"),
  },
];

export function CommandPalette() {
  const os = useOs();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COMMANDS;
    return COMMANDS.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(s));
  }, [q]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/45 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-gold-400/20 bg-ink-900 shadow-window"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (q.startsWith("/") || q.length > 12) {
                    os.openApp("cortex" as AppId);
                    void os.ask(q.replace(/^\//, ""));
                    setOpen(false);
                    setQ("");
                    return;
                  }
                  list[0]?.run(os);
                  setOpen(false);
                  setQ("");
                }
              }}
              placeholder="Hunt a command, or type a thought…"
              className="w-full border-b border-white/5 bg-transparent px-5 py-4 text-[15px] text-paper outline-none placeholder:text-mist/40"
            />
            <ul className="max-h-72 overflow-auto py-2">
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      c.run(os);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center justify-between px-5 py-2.5 text-left hover:bg-gold-400/8"
                  >
                    <span className="text-sm text-paper">{c.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-gold-500/70">
                      {c.hint}
                    </span>
                  </button>
                </li>
              ))}
              {!list.length ? (
                <li className="px-5 py-3 text-sm text-mist/60">Press enter to ask Cortex.</li>
              ) : null}
            </ul>
            <div className="border-t border-white/5 px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-mist/40">
              esc close · enter run · ⌘K toggle
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

import { motion } from "framer-motion";
import type { AppId } from "../lib/types";
import { useOs } from "../state/OsProvider";
import { CortexApp } from "./apps/CortexApp";
import { ForgeApp } from "./apps/ForgeApp";
import { PulseApp } from "./apps/PulseApp";
import { SpectreApp } from "./apps/SpectreApp";
import { SwarmApp } from "./apps/SwarmApp";
import { VaultApp } from "./apps/VaultApp";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { WindowFrame } from "./WindowFrame";

const APPS: Record<AppId, React.ComponentType> = {
  cortex: CortexApp,
  swarm: SwarmApp,
  vault: VaultApp,
  forge: ForgeApp,
  spectre: SpectreApp,
  pulse: PulseApp,
};

export function Desktop() {
  const os = useOs();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex h-full flex-col overflow-hidden fx-grid"
    >
      <div className="fx-grain" />
      <MenuBar />

      <div className="relative min-h-0 flex-1">
        <Wallpaper />
        {os.windows.map((w) => {
          const View = APPS[w.app];
          return (
            <WindowFrame key={w.id} win={w}>
              <View />
            </WindowFrame>
          );
        })}
        {os.notices[0] ? (
          <motion.div
            key={os.notices[0]}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-4 top-4 z-[60] max-w-xs rounded-2xl border border-gold-400/20 bg-ink-900/90 px-4 py-3 text-sm text-paper shadow-window"
          >
            {os.notices[0]}
          </motion.div>
        ) : null}
      </div>

      <Dock />
    </motion.div>
  );
}

function Wallpaper() {
  const os = useOs();
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 pb-24 pt-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-gold-400/55">
        Aitzaz · Fellx
      </p>
      <h2 className="mt-3 max-w-xl text-center font-serif text-5xl italic leading-[1.05] text-paper/90 md:text-6xl">
        The desk is still.
        <br />
        The kernel hunts.
      </h2>
      <p className="mt-5 max-w-md text-center text-sm text-mist/65">
        Press <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd>{" "}
        to hunt a command, or open Cortex from the dock.
      </p>
      <div className="mt-10 grid w-full max-w-2xl grid-cols-3 gap-3">
        <Mini k="Vault nodes" v={String(os.memories.length)} />
        <Mini k="Swarm" v={`${os.agents.filter((a) => a.status !== "idle").length} live`} />
        <Mini k="Uptime" v={`${Math.floor(os.metrics.uptime / 1000)}s`} />
      </div>
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-gold-400/10 bg-ink-950/35 px-4 py-3 text-center backdrop-blur-md">
      <div className="font-mono text-[10px] uppercase tracking-widest text-gold-500/60">{k}</div>
      <div className="mt-1 font-serif text-2xl italic text-paper">{v}</div>
    </div>
  );
}

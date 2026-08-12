import { useEffect, useState } from "react";
import { useOs } from "../state/OsProvider";
import { Mark } from "./Mark";

export function MenuBar() {
  const os = useOs();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <header className="relative z-[80] flex h-11 items-center justify-between border-b border-gold-400/10 bg-ink-950/70 px-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Mark className="h-7 w-7" />
        <div className="leading-tight">
          <div className="text-[13px] font-medium tracking-wide text-paper">Aitzaz Fellx</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold-400/70">
            kernel ready
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-5 text-[11px] text-mist/80 sm:flex">
        <Stat label="pulse" value={`${os.metrics.pulse}%`} />
        <Stat label="heat" value={`${os.metrics.heat}%`} warn={os.metrics.heat > 64} />
        <Stat label="vault" value={`${os.memories.length}`} />
        <Stat label="swarm" value={`${os.metrics.swarm} hunt`} />
      </div>

      <div className="flex items-center gap-4 font-mono text-[11px] text-gold-300/80">
        <span className="hidden md:inline text-mist/70">{date}</span>
        <span>{time}</span>
        <span className="flex items-center gap-1.5 text-moss">
          <span className="fx-dot bg-moss shadow-[0_0_10px_#8faf8a]" />
          live
        </span>
      </div>
    </header>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono uppercase tracking-widest text-gold-500/55">{label}</span>
      <span className={warn ? "text-rose" : "text-paper/90"}>{value}</span>
    </div>
  );
}

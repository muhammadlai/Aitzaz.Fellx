import { useOs } from "../../state/OsProvider";

export function PulseApp() {
  const os = useOs();
  const m = os.metrics;
  const bars = [
    { k: "Pulse", v: m.pulse, c: "bg-gold-400" },
    { k: "Heat", v: m.heat, c: "bg-ember" },
    { k: "Vault", v: m.memoryLoad, c: "bg-moss" },
  ];

  return (
    <div className="grid h-full min-h-[420px] gap-4 p-5 lg:grid-cols-[1fr_1fr]">
      <section>
        <div className="font-serif text-2xl italic">Pulse</div>
        <p className="mt-1 text-xs text-mist/70">Live kernel fabric. Nothing leaves this machine.</p>
        <div className="mt-5 space-y-4">
          {bars.map((b) => (
            <div key={b.k}>
              <div className="mb-1 flex justify-between font-mono text-[11px] text-mist/70">
                <span>{b.k}</span>
                <span>{b.v}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-700">
                <div className={`h-full ${b.c}`} style={{ width: `${b.v}%` }} />
              </div>
            </div>
          ))}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3">
          <Card k="Uptime" v={`${Math.floor(m.uptime / 1000)}s`} />
          <Card k="Agents hunting" v={String(m.swarm)} />
          <Card k="Memories" v={String(os.memories.length)} />
          <Card k="Windows" v={String(os.windows.length)} />
        </dl>
      </section>
      <section className="flex min-h-0 flex-col rounded-2xl border border-white/5 bg-ink-800/40">
        <div className="border-b border-white/5 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-gold-500/70">
          Event stream
        </div>
        <ul className="fx-scroll flex-1 space-y-2 overflow-auto p-3">
          {os.events.map((e) => (
            <li key={e.id} className="flex gap-2 font-mono text-[11px]">
              <span
                className={
                  e.level === "ok"
                    ? "text-moss"
                    : e.level === "warn"
                      ? "text-ember"
                      : e.level === "crit"
                        ? "text-rose"
                        : "text-gold-500/70"
                }
              >
                {e.level}
              </span>
              <span className="text-mist/50">{e.source}</span>
              <span className="text-paper/85">{e.message}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Card({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-800/60 px-3 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-gold-500/60">{k}</dt>
      <dd className="mt-1 font-serif text-2xl italic text-paper">{v}</dd>
    </div>
  );
}

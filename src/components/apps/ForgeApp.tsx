import { useOs } from "../../state/OsProvider";

export function ForgeApp() {
  const os = useOs();
  return (
    <div className="p-5">
      <div className="mb-5">
        <div className="font-serif text-2xl italic">Forge</div>
        <p className="mt-1 text-xs text-mist/70">Workflows with retries in spirit, steps in sequence.</p>
      </div>
      <div className="space-y-4">
        {os.workflows.map((wf) => (
          <article key={wf.id} className="rounded-2xl border border-white/5 bg-ink-800/55 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl italic text-paper">{wf.name}</h3>
                <p className="mt-1 text-sm text-mist/75">{wf.summary}</p>
              </div>
              <button
                disabled={wf.status === "running"}
                onClick={() => os.runWorkflow(wf.id)}
                className="rounded-full bg-gold-400 px-3 py-1.5 text-xs font-medium text-ink-950 disabled:opacity-40"
              >
                {wf.status === "running" ? "Running" : wf.status === "ok" ? "Run again" : "Run"}
              </button>
            </div>
            <ol className="mt-4 flex flex-wrap gap-2">
              {wf.steps.map((s, i) => {
                const on = i <= wf.cursor;
                const here = wf.status === "running" && i === wf.cursor;
                return (
                  <li
                    key={s.id}
                    className={`min-w-[120px] flex-1 rounded-xl border px-3 py-2 ${
                      here
                        ? "border-gold-400/50 bg-gold-400/10"
                        : on
                          ? "border-moss/30 bg-moss/10"
                          : "border-white/5 bg-ink-900/40"
                    }`}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-widest text-gold-500/70">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="text-sm text-paper">{s.label}</div>
                    <div className="mt-1 text-[11px] text-mist/60">{s.detail}</div>
                  </li>
                );
              })}
            </ol>
          </article>
        ))}
      </div>
    </div>
  );
}

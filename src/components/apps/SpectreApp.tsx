import { useOs } from "../../state/OsProvider";

export function SpectreApp() {
  const os = useOs();
  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="fx-dot bg-white/10" />
          <span className="fx-dot bg-white/10" />
        </div>
        <div className="flex-1 rounded-lg border border-white/10 bg-ink-800 px-3 py-1.5 font-mono text-[11px] text-mist/70">
          spectre://lane
        </div>
        <button
          onClick={() => os.scan()}
          className="rounded-lg bg-gold-400 px-3 py-1.5 text-xs font-medium text-ink-950"
        >
          Scan
        </button>
      </div>
      <div className="grid flex-1 gap-3 p-4 md:grid-cols-[200px_1fr]">
        <aside className="space-y-1">
          {os.tabs.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-white/5 bg-ink-800/60 px-3 py-2 text-left"
            >
              <div className="truncate text-xs text-paper">{t.title}</div>
              <div className="truncate font-mono text-[10px] text-gold-500/60">{t.url}</div>
            </div>
          ))}
        </aside>
        <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-ink-700/40 to-ink-900 p-5">
          <div className="font-serif text-3xl italic text-paper">Browser theatre</div>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-mist/75">
            Spectre does not leave the desk. It walks captured pages, overlays traces, and files
            what matters into the vault.
          </p>
          <div className="mt-6 space-y-3">
            {os.tabs.map((t) => (
              <article key={t.id} className="rounded-xl border border-gold-400/10 bg-ink-950/40 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-gold-200">{t.title}</h3>
                  <span className="font-mono text-[10px] uppercase text-mist/50">{t.status}</span>
                </div>
                <p className="mt-2 text-sm text-mist/80">{t.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

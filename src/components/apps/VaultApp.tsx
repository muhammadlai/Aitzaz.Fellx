import { useMemo, useState } from "react";
import { scoreMemory } from "../../lib/search";
import { useOs } from "../../state/OsProvider";

export function VaultApp() {
  const os = useOs();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const rows = useMemo(() => {
    if (!q.trim()) return os.memories;
    return [...os.memories].sort((a, b) => scoreMemory(q, b) - scoreMemory(q, a));
  }, [os.memories, q]);

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="font-serif text-2xl italic">Vault</div>
        <p className="mt-1 text-xs text-mist/70">Episodic, semantic, procedural — local fabric only.</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search traces…"
          className="mt-3 w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none focus:border-gold-400/40"
        />
      </div>
      <div className="fx-scroll flex-1 space-y-3 overflow-auto p-5">
        {rows.map((m) => (
          <article key={m.id} className="rounded-2xl border border-white/5 bg-ink-800/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-paper">{m.title}</h3>
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold-500/70">
                {m.kind}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-mist/80">{m.body}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-mist/70">
                  {t}
                </span>
              ))}
              <span className="ml-auto font-mono text-[10px] text-gold-400/60">
                {Math.round(m.strength * 100)}% hold
              </span>
            </div>
          </article>
        ))}
      </div>
      <form
        className="flex gap-2 border-t border-white/5 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          os.remember(draft.slice(0, 42), draft.trim());
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="File a new memory…"
          className="flex-1 rounded-xl border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none"
        />
        <button className="rounded-xl border border-gold-400/30 px-3 text-sm text-gold-300">Seal</button>
      </form>
    </div>
  );
}

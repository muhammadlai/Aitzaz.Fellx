import { useEffect, useRef, useState } from "react";
import { useOs } from "../../state/OsProvider";

export function CortexApp() {
  const os = useOs();
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [os.messages.length]);

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="font-serif text-2xl italic text-paper">Cortex</div>
        <p className="mt-1 text-xs text-mist/70">
          Local reasoning. Ask to remember, dispatch Iris, or run a workflow.
        </p>
      </div>
      <div className="fx-scroll flex-1 space-y-4 overflow-auto px-5 py-4">
        {os.messages.map((m) => (
          <article key={m.id} className={m.role === "user" ? "ml-10" : "mr-6"}>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-gold-500/70">
              {m.role === "fellx" ? "Fellx" : m.role}
            </div>
            <div
              className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gold-400/12 text-paper"
                  : m.role === "system"
                    ? "border border-white/5 bg-ink-800/70 text-mist"
                    : "bg-ink-700/80 text-paper"
              }`}
            >
              {m.text}
            </div>
            {m.traces?.length ? (
              <ul className="mt-2 space-y-1 font-mono text-[10px] text-moss/80">
                {m.traces.map((t) => (
                  <li key={t}>↳ {t}</li>
                ))}
              </ul>
            ) : null}
            {m.tools?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.tools.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-gold-400/20 px-2 py-0.5 font-mono text-[10px] text-gold-300/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
        <div ref={end} />
      </div>
      <form
        className="flex gap-2 border-t border-white/5 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void os.ask(draft);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Speak to the kernel…"
          className="flex-1 rounded-xl border border-white/10 bg-ink-800 px-3 py-2.5 text-sm outline-none placeholder:text-mist/35 focus:border-gold-400/40"
        />
        <button
          type="submit"
          className="rounded-xl bg-gold-400 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-gold-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}

import { useOs } from "../../state/OsProvider";

const ROLE_TONE: Record<string, string> = {
  researcher: "text-gold-300",
  operator: "text-paper",
  sentinel: "text-moss",
  scribe: "text-ember",
  architect: "text-rose",
};

export function SwarmApp() {
  const os = useOs();
  return (
    <div className="p-5">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="font-serif text-2xl italic">Swarm</div>
          <p className="mt-1 text-xs text-mist/70">Five specialists. Dispatch is explicit.</p>
        </div>
        <button
          onClick={() => os.dispatch("Iris", "Compile a vault brief for the operator")}
          className="rounded-full border border-gold-400/30 px-3 py-1.5 text-xs text-gold-300 hover:bg-gold-400/10"
        >
          Wake Iris
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {os.agents.map((a) => (
          <article key={a.id} className="rounded-2xl border border-white/5 bg-ink-800/60 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-serif text-xl italic text-paper">{a.name}</div>
                <div className={`font-mono text-[10px] uppercase tracking-widest ${ROLE_TONE[a.role]}`}>
                  {a.role}
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                  a.status === "hunting"
                    ? "bg-ember/20 text-ember"
                    : a.status === "landed"
                      ? "bg-moss/20 text-moss"
                      : "bg-white/5 text-mist"
                }`}
              >
                {a.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-mist/80">{a.brief}</p>
            {a.task ? <p className="mt-2 text-xs text-gold-300/80">Hunt · {a.task}</p> : null}
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-mist/50">
              <span>{a.cycles} cycles</span>
              <button
                className="text-gold-400 hover:text-gold-200"
                onClick={() => os.dispatch(a.name, `Assist from the ${a.role} lane`)}
              >
                dispatch
              </button>
            </div>
            <ul className="mt-3 space-y-1 border-t border-white/5 pt-3 font-mono text-[10px] text-mist/60">
              {a.log.slice(0, 3).map((l) => (
                <li key={l}>· {l}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

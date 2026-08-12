import type { AppId } from "../lib/types";
import { useOs } from "../state/OsProvider";

const ITEMS: { id: AppId; glyph: string; hint: string }[] = [
  { id: "cortex", glyph: "Cx", hint: "Think" },
  { id: "swarm", glyph: "Sw", hint: "Agents" },
  { id: "vault", glyph: "Vt", hint: "Memory" },
  { id: "forge", glyph: "Fg", hint: "Flows" },
  { id: "spectre", glyph: "Sp", hint: "Browse" },
  { id: "pulse", glyph: "Pl", hint: "Health" },
];

export function Dock() {
  const os = useOs();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-[70] flex justify-center">
      <nav className="pointer-events-auto flex items-end gap-1.5 rounded-2xl border border-gold-400/15 bg-ink-950/75 px-2 py-2 shadow-window backdrop-blur-xl">
        {ITEMS.map((item) => {
          const open = os.windows.some((w) => w.app === item.id && !w.minimized);
          const active = os.activeApp === item.id;
          return (
            <button
              key={item.id}
              onClick={() => os.openApp(item.id)}
              className="group flex w-14 flex-col items-center gap-1 rounded-xl px-1 py-1 transition hover:-translate-y-1"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl border font-serif text-[15px] italic ${
                  active
                    ? "border-gold-400/50 bg-gold-400/15 text-gold-200 shadow-glow"
                    : "border-white/5 bg-ink-700/80 text-gold-300"
                }`}
              >
                {item.glyph}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-mist/60">{item.hint}</span>
              <span className={`h-1 w-1 rounded-full ${open ? "bg-gold-400" : "bg-transparent"}`} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

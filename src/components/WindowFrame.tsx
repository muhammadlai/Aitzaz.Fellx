import { motion } from "framer-motion";
import { useRef } from "react";
import type { WindowState } from "../lib/types";
import { useOs } from "../state/OsProvider";

export function WindowFrame({
  win,
  children,
}: {
  win: WindowState;
  children: React.ReactNode;
}) {
  const os = useOs();
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  if (win.minimized) return null;

  const style = win.maximized
    ? { left: 8, top: 52, width: "calc(100% - 16px)", height: "calc(100% - 118px)", zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={style}
      onPointerDown={() => os.focus(win.id)}
      className="absolute flex flex-col overflow-hidden rounded-2xl border border-gold-400/15 bg-ink-900/92 shadow-window backdrop-blur-xl"
    >
      <header
        className="flex h-10 shrink-0 cursor-grab items-center justify-between border-b border-white/5 px-3 active:cursor-grabbing"
        onPointerDown={(e) => {
          if (win.maximized) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          os.move(win.id, e.clientX - drag.current.dx, Math.max(36, e.clientY - drag.current.dy));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <div className="flex items-center gap-2">
          <button
            aria-label="Close"
            onClick={() => os.close(win.id)}
            className="fx-dot bg-rose/80 hover:bg-rose"
          />
          <button
            aria-label="Minimize"
            onClick={() => os.minimize(win.id)}
            className="fx-dot bg-gold-500/80 hover:bg-gold-400"
          />
          <button
            aria-label="Maximize"
            onClick={() => os.maximize(win.id)}
            className="fx-dot bg-moss/80 hover:bg-moss"
          />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-300/70">
          {win.title}
        </div>
        <div className="w-14" />
      </header>
      <div className="fx-scroll min-h-0 flex-1 overflow-auto">{children}</div>
    </motion.section>
  );
}

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useOs } from "../state/OsProvider";
import { Mark } from "./Mark";

const STEPS = [
  "Aitzaz Fellx  ·  kernel 1.0",
  "Checking desk contracts",
  "Hydrating vault fabric",
  "Binding swarm runtime",
  "Arming forge + spectre",
];

export function BootScreen() {
  const { boot, kernel } = useOs();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (kernel === "offline") boot();
  }, [kernel, boot]);

  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 380);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.5 }}
      className="relative flex h-full flex-col items-center justify-center fx-grid overflow-hidden"
    >
      <div className="fx-grain" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex w-[min(440px,90vw)] flex-col items-center text-center"
      >
        <Mark className="h-16 w-16 shadow-glow" />
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.38em] text-gold-400/80">
          Autonomous OS
        </p>
        <h1 className="mt-3 font-serif text-5xl italic text-paper">Fellx</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist/80">
          A quiet kernel for Aitzaz. Agents hunt. The vault remembers. The desk stays still.
        </p>

        <div className="mt-10 w-full space-y-2 text-left font-mono text-[11px] text-gold-300/70">
          {STEPS.slice(0, step + 1).map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-gold-500/50">{String(i + 1).padStart(2, "0")}</span>
              <span>{line}</span>
              {i === step ? <span className="ml-auto animate-pulse text-moss">●</span> : <span className="ml-auto text-moss/70">ok</span>}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 h-[2px] w-full overflow-hidden rounded bg-ink-700">
          <motion.div
            className="h-full bg-gradient-to-r from-ember to-gold-400"
            initial={{ width: "4%" }}
            animate={{ width: `${18 + step * 20}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

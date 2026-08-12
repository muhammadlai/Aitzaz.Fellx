import { AnimatePresence } from "framer-motion";
import { BootScreen } from "./components/BootScreen";
import { CommandPalette } from "./components/CommandPalette";
import { Desktop } from "./components/Desktop";
import { useOs } from "./state/OsProvider";

export default function App() {
  const os = useOs();
  const live = os.kernel === "ready";

  return (
    <>
      <AnimatePresence mode="wait">
        {live ? <Desktop key="desk" /> : <BootScreen key="boot" />}
      </AnimatePresence>
      {live ? <CommandPalette /> : null}
    </>
  );
}

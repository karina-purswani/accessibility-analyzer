import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-3 items-center mb-12"
    >
      {/* LEFT EMPTY SPACE (keeps center true) */}
      <div />

      {/* CENTER TITLE */}
      <div className="flex items-center justify-center gap-3">
        <Sparkles className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Accessibility Analyzer
        </h1>
      </div>

      {/* RIGHT DARK MODE TOGGLE */}
      <div className="flex justify-end">
        <DarkModeToggle />
      </div>
    </motion.header>
  );
}

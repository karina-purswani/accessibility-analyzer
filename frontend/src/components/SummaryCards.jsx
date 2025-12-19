import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SummaryCards({ violations, passes, incomplete }) {
  const cards = [
    {
      title: "Violations",
      value: violations,
      icon: AlertTriangle,
      accent: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Passes",
      value: passes,
      icon: CheckCircle,
      accent: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Incomplete",
      value: incomplete,
      icon: HelpCircle,
      accent: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.12,
            duration: 0.4,
            ease: "easeOut",
          }}
          whileHover={{ y: -4 }}
          className={`relative rounded-2xl p-6 shadow-soft ${card.bg}`}
        >
          {/* BACKGROUND ICON */}
          <div className="absolute top-4 right-4 opacity-20">
            <card.icon className="w-10 h-10" />
          </div>

          {/* CONTENT */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {card.title}
          </p>

          <p className={`text-4xl font-bold ${card.accent}`}>
            {card.value}
          </p>

          {/* SUBTEXT */}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Total {card.title.toLowerCase()}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

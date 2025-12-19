import { AlertCircle } from "lucide-react";
import ChartCard from "./ChartCard"; // ✅ Using your component for 100% style match

// --- SCORE ALGORITHM ---
const calculateScore = (violations, passes) => {
  const total = violations.length + passes.length;
  if (total === 0) return 100;
  
  let score = 100;
  violations.forEach(v => {
    if (v.impact === 'critical') score -= 15;
    else if (v.impact === 'serious') score -= 10;
    else if (v.impact === 'moderate') score -= 5;
    else score -= 1;
  });

  return Math.max(0, Math.min(100, Math.round(score)));
};

export default function HealthScoreCard({ violations = [], passes = [] }) {
  const score = calculateScore(violations, passes);
  
  // Ring Math
  const radius = 40;
  const circumference = 2 * Math.PI * radius; 
  const offset = circumference - (score / 100) * circumference;
  
  // Dynamic Colors
  const color = score >= 80 ? "text-green-600 dark:text-green-400" : score >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";
  const ringColor = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="h-full">
      <ChartCard 
        title="Accessibility Score" 
        subtitle="Weighted WCAG 2.1 Impact"
      >
        <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
          
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Background Ring */}
            <svg className="transform -rotate-90 w-28 h-28">
              <circle 
                cx="56" cy="56" r={radius} 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="transparent" 
                className="text-gray-100 dark:text-gray-800" 
              />
              {/* Progress Ring */}
              <circle 
                cx="56" cy="56" r={radius} 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={circumference} 
                strokeDashoffset={offset} 
                strokeLinecap="round"
                className={`${ringColor} transition-all duration-1000 ease-out`} 
              />
            </svg>
            
            {/* Score Number */}
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-bold ${color} tracking-tight`}>
                {score}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                / 100
              </span>
            </div>
          </div>

        </div>
      </ChartCard>
    </div>
  );
}
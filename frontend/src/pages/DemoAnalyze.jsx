import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, Lock, AlertTriangle, CheckCircle, HelpCircle 
} from "lucide-react";

// Reuse your existing powerful components
import ScanForm from "../components/ScanForm";
import SeverityChart from "../components/SeverityChart";
import ResultPieChart from "../components/ResultPieChart";
import ViolationsTable from "../components/ViolationsTable";
import ChartCard from "../components/ChartCard"; // ✅ Using ChartCard wrapper for consistency

export default function DemoAnalyze() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  // 1️⃣ CHECK LIMIT ON MOUNT
  useEffect(() => {
    const hasUsedDemo = localStorage.getItem("demo_scan_used");
    if (hasUsedDemo) {
      setLimitReached(true);
    }
  }, []);

  const handleScan = async () => {
    if (!url) return;
    
    if (localStorage.getItem("demo_scan_used")) {
      setLimitReached(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url, 
          userId: null, 
          userEmail: "Guest Demo" 
        }),
      });

      if (!response.ok) throw new Error("Backend scan failed");
      const data = await response.json();

      setResults({
        violations: data.data.violations || [],
        passes: data.data.passes || [],
        incomplete: data.data.incomplete || []
      });

      localStorage.setItem("demo_scan_used", "true");

    } catch (err) {
      console.error(err);
      setError("Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: SCORE CALC ---
  const calculateHealthScore = (violations, passes) => {
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

  // --- RENDER HELPERS (MATCHING ANALYZE.JSX STYLE) ---
  const score = results ? calculateHealthScore(results.violations, results.passes) : 0;
  
  // Ring Math (Fits w-16 container perfectly)
  const radius = 26; 
  const circumference = 2 * Math.PI * radius; 
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";

  // 4️⃣ RENDER THE "LIMIT REACHED" SCREEN
  if (limitReached) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Free Demo Limit Reached</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            You've already used your free scan. Create an account to unlock unlimited scans, history tracking, and PDF reports.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Create Free Account
            </button>
            <Link to="/" className="block text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5️⃣ RENDER THE DEMO PAGE
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-10 pt-24">
      {/* DEMO BANNER */}
      <div className="fixed top-0 left-0 w-full bg-blue-600 text-white text-center py-2 text-sm font-medium z-50">
        You are viewing a free demo. 
        <Link to="/login" className="text-white underline hover:text-blue-100 ml-1 font-bold">
          Sign up
        </Link> to save your results.
      </div>

      <div className="max-w-7xl mx-auto space-y-12 mt-6">
        
        {/* Simplified Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quick Accessibility Check</h1>
          <p className="text-gray-500 mt-2">Enter a URL to see a one-time snapshot.</p>
        </div>

        {/* Scan Form */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-8">
          <ScanForm url={url} setUrl={setUrl} loading={loading} onScan={handleScan} error={error} />
        </section>

        {/* Results */}
        {results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            
            {/* --- UNIFIED STATS GRID (MATCHING ANALYZE.JSX) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Violations */}
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <ChartCard title="Violations" subtitle="Issues to fix">
                  <div className="flex items-center justify-between mt-4 min-h-[64px]">
                    <p className="text-5xl font-bold text-red-600 dark:text-red-400">{results.violations.length}</p>
                    <div className="opacity-20"><AlertTriangle className="w-16 h-16" /></div>
                  </div>
                </ChartCard>
              </motion.div>

              {/* Card 2: Passes */}
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <ChartCard title="Passes" subtitle="Successful checks">
                  <div className="flex items-center justify-between mt-4 min-h-[64px]">
                    <p className="text-5xl font-bold text-green-600 dark:text-green-400">{results.passes.length}</p>
                    <div className="opacity-20"><CheckCircle className="w-16 h-16" /></div>
                  </div>
                </ChartCard>
              </motion.div>

              {/* Card 3: Incomplete */}
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <ChartCard title="Incomplete" subtitle="Needs review">
                  <div className="flex items-center justify-between mt-4 min-h-[64px]">
                    <p className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">{results.incomplete.length}</p>
                    <div className="opacity-20"><HelpCircle className="w-16 h-16" /></div>
                  </div>
                </ChartCard>
              </motion.div>

              {/* Card 4: Health Score (Balanced Size) */}
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <ChartCard title="Health Score" subtitle="Weighted rating">
                  <div className="flex items-center justify-between mt-4 min-h-[64px]">
                    
                    {/* Value */}
                    <div>
                      <p className={`text-5xl font-bold ${scoreColor}`}>{score}</p>
                      <p className="text-xs text-gray-400 uppercase font-bold mt-1">/ 100</p>
                    </div>

                    {/* Ring Visual (w-16 h-16) */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="transform -rotate-90 w-16 h-16">
                        <circle 
                          cx="32" cy="32" r={radius} 
                          stroke="currentColor" strokeWidth="6" fill="transparent" 
                          className="text-gray-100 dark:text-gray-800" 
                        />
                        <circle 
                          cx="32" cy="32" r={radius} 
                          stroke="currentColor" strokeWidth="6" fill="transparent" 
                          strokeDasharray={circumference} 
                          strokeDashoffset={offset} 
                          strokeLinecap="round"
                          className={`${scoreColor} transition-all duration-1000 ease-out`} 
                        />
                      </svg>
                    </div>

                  </div>
                </ChartCard>
              </motion.div>

            </div>

            {/* CTA BLOCK (Unique to Demo) */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
               <div className="text-center sm:text-left">
                 <h3 className="font-bold text-lg">Want to export this report?</h3>
                 <p className="text-blue-100 text-sm">Sign up now to download PDF, CSV, and JSON reports.</p>
               </div>
               <button 
                 onClick={() => navigate("/login")} 
                 className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2 whitespace-nowrap"
               >
                 Sign Up <ArrowRight className="w-4 h-4" />
               </button>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <ChartCard title="Violations Severity"><div style={{ width: "100%", height: 300 }}><SeverityChart violations={results.violations} /></div></ChartCard>
               <ChartCard title="Result Distribution"><div style={{ width: "100%", height: 300 }}><ResultPieChart violations={results.violations.length} passes={results.passes.length} incomplete={results.incomplete.length} /></div></ChartCard>
            </section>

            <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-6">
              <ViolationsTable violations={results.violations} />
            </section>

          </motion.div>
        )}
      </div>
    </div>
  );
}
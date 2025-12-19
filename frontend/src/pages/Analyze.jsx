import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, Calendar, AlertTriangle, CheckCircle, HelpCircle 
} from "lucide-react";

import Header from "../components/Header";
import ScanForm from "../components/ScanForm";
import SeverityChart from "../components/SeverityChart";
import ResultPieChart from "../components/ResultPieChart";
import ViolationsTable from "../components/ViolationsTable";
import ExportReportBar from "../components/ExportReportBar";
import ChartCard from "../components/ChartCard"; 

import { useAuth } from "../context/AuthContext";

// --- HELPER: CALCULATE SCORE ---
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

export default function Analyze() {
  const { user, loading: authLoading } = useAuth();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // --- EXPORT HANDLERS ---
  const handlePrintPDF = () => window.print();

  const handleDownloadJSON = () => {
    if (!results) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `accessibility_report.json`;
    a.click();
  };

  const handleDownloadCSV = () => {
    if (!results) return;
    const rows = [
      ["Rule ID", "Impact", "Description", "Elements"],
      ...results.violations.map(v => [v.id, v.impact, `"${v.description}"`, v.nodes.length])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csvContent);
    a.download = `accessibility_report.csv`;
    a.click();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 dark:text-white">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 dark:text-white">Please log in.</div>;

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, userId: user.uid, userEmail: user.email }),
      });

      if (!response.ok) throw new Error("Backend scan failed");
      const data = await response.json();

      setResults({
        violations: data.data.violations || [],
        passes: data.data.passes || [],
        incomplete: data.data.incomplete || []
      });

    } catch (err) {
      console.error(err);
      setError("Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const score = results ? calculateHealthScore(results.violations, results.passes) : 0;
  
  // Ring Math (Fits w-16 container perfectly)
  const radius = 26; 
  const circumference = 2 * Math.PI * radius; 
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-10 pt-24 print:bg-white print:p-0 print:pt-0">
      <div className="max-w-7xl mx-auto space-y-12 print:space-y-6">

        {/* 1. HEADER */}
        <div className="print:hidden"><Header /></div>

        {/* 2. REPORT HEADER (Print Only) */}
        <div className="hidden print:block mb-8 border-b-2 border-blue-600 pb-6 pt-10 px-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Accessibility Audit Report</h1>
              <p className="text-gray-500 mt-2 text-lg">Analysis for {url}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">AA</div>
            </div>
          </div>
        </div>

        {/* 3. SCAN FORM */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-8 print:hidden">
          <ScanForm url={url} setUrl={setUrl} loading={loading} onScan={handleScan} error={error} />
        </section>

        {/* 4. RESULTS DASHBOARD */}
        {results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 print:space-y-8 print:px-8">
            
            {/* --- UNIFIED STATS GRID (4 Columns) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Violations */}
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <ChartCard title="Violations" subtitle="Issues to fix">
                  <div className="flex items-center justify-between mt-4 min-h-[64px]">
                    {/* Increased Text Size */}
                    <p className="text-5xl font-bold text-red-600 dark:text-red-400">{results.violations.length}</p>
                    {/* Increased Icon Size (w-16) */}
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

              {/* Card 4: Health Score (Balanced) */}
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <ChartCard title="Health Score" subtitle="Weighted rating">
                  <div className="flex items-center justify-between mt-4 min-h-[64px]">
                    
                    {/* Value (Matches other cards' text size) */}
                    <div>
                      <p className={`text-5xl font-bold ${scoreColor}`}>{score}</p>
                      <p className="text-xs text-gray-400 uppercase font-bold mt-1">/ 100</p>
                    </div>

                    {/* Ring Visual (Matches other cards' icon size: w-16) */}
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

            {/* EXPORT BAR */}
            <div className="print:hidden">
              <ExportReportBar onPdf={handlePrintPDF} onJson={handleDownloadJSON} onCsv={handleDownloadCSV} />
            </div>

            {/* CHARTS */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:break-inside-avoid">
              <ChartCard title="Violations Severity">
                 <div style={{ width: "100%", height: 300 }}>
                  <SeverityChart violations={results.violations} />
                 </div>
              </ChartCard>
              <ChartCard title="Result Distribution">
                 <div style={{ width: "100%", height: 300 }}>
                  <ResultPieChart violations={results.violations.length} passes={results.passes.length} incomplete={results.incomplete.length} />
                 </div>
              </ChartCard>
            </section>

            {/* TABLE */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-6 print:shadow-none print:border print:p-0">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white print:text-black border-b pb-2 px-2">
                Detailed Violations Log
              </h3>
              <ViolationsTable violations={results.violations} />
            </section>

            {/* FOOTER */}
            <div className="hidden print:flex fixed bottom-6 right-8 text-gray-400 font-semibold text-sm items-center gap-2">
              <span>Generated by Accessibility Analyzer (SK)</span>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
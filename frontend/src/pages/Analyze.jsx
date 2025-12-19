import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, AlertTriangle, CheckCircle, HelpCircle 
} from "lucide-react";

import Header from "../components/Header";
import ScanForm from "../components/ScanForm";
import SeverityChart from "../components/SeverityChart";
import ResultPieChart from "../components/ResultPieChart";
import ViolationsTable from "../components/ViolationsTable";
import ExportReportBar from "../components/ExportReportBar";
import ChartCard from "../components/ChartCard"; 
import VisualInspector from "../components/VisualInspector";

import { useAuth } from "../context/AuthContext";

// --- HELPER: CALCULATE HEALTH SCORE ---
const calculateHealthScore = (violations, passes) => {
  const total = violations.length + (passes?.length || 0);
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
  const [activeViolation, setActiveViolation] = useState(null);

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
    setActiveViolation(null);

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
        incomplete: data.data.incomplete || [],
        screenshot: data.data.screenshot || null 
      });

    } catch (err) {
      console.error(err);
      setError("Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const score = results ? calculateHealthScore(results.violations, results.passes) : 0;
  const radius = 26; 
  const circumference = 2 * Math.PI * radius; 
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-10 pt-24 print:bg-white print:p-0 print:pt-0">
      
      {/* PRINT MEDIA QUERIES
          1. Removes browser artifacts like "History" and "frontend".
          2. Ensures exact visual rendering of screenshots and highlights.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 1cm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          
          /* Hide non-report UI */
          header, nav, .history-container, .user-nav, [data-testid="header"] { display: none !important; }

          /* Layout management for PDF */
          .print-stack { display: block !important; width: 100% !important; margin-bottom: 2rem !important; }
          .print-break-page { break-before: page !important; }
          
          /* Force Inspector to fill width in report */
          .inspector-report-view { height: auto !important; max-height: none !important; overflow: visible !important; width: 100% !important; }
        }
      `}} />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* WEB HEADER (Hidden in Print) */}
        <div className="print:hidden no-print"><Header /></div>
        
        {/* REPORT HEADER */}
        <div className="hidden print:block mb-10 border-b-2 border-blue-600 pb-6 pt-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Accessibility Audit Report</h1>
              <p className="text-gray-500 mt-2 text-lg">Analysis for: <span className="font-medium text-blue-600 italic">{url}</span></p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-blue-600 italic">AA</div>
            </div>
          </div>
        </div>

        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-8 print:hidden no-print border dark:border-gray-800">
          <ScanForm url={url} setUrl={setUrl} loading={loading} onScan={handleScan} error={error} />
        </section>

        {results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            
            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2">
              <ChartCard title="Violations" subtitle="Issues to fix">
                <div className="flex items-center justify-between mt-4">
                  <p className="text-5xl font-bold text-red-600">{results.violations.length}</p>
                  <AlertTriangle className="w-12 h-12 opacity-20" />
                </div>
              </ChartCard>
              <ChartCard title="Passes" subtitle="Successful checks">
                <div className="flex items-center justify-between mt-4">
                  <p className="text-5xl font-bold text-green-600">{results.passes.length}</p>
                  <CheckCircle className="w-12 h-12 opacity-20" />
                </div>
              </ChartCard>
              <ChartCard title="Incomplete" subtitle="Needs review">
                <div className="flex items-center justify-between mt-4">
                  <p className="text-5xl font-bold text-yellow-600">{results.incomplete.length}</p>
                  <HelpCircle className="w-12 h-12 opacity-20" />
                </div>
              </ChartCard>
              <ChartCard title="Health Score" subtitle="Weighted rating">
                <div className="flex items-center justify-between mt-4">
                   <p className={`text-5xl font-bold ${scoreColor}`}>{score}</p>
                </div>
              </ChartCard>
            </div>

            <div className="print:hidden no-print">
              <ExportReportBar onPdf={handlePrintPDF} onJson={handleDownloadJSON} onCsv={handleDownloadCSV} />
            </div>

            {/* ANALYTICS CHARTS */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-12">
              <ChartCard title="Violations Severity" className="bg-white dark:bg-gray-900 border rounded-2xl shadow-soft">
                  <div style={{ width: "100%", height: 350 }}>
                    <SeverityChart violations={results.violations} />
                  </div>
              </ChartCard>
              <ChartCard title="Result Distribution" className="bg-white dark:bg-gray-900 border rounded-2xl shadow-soft">
                  <div style={{ width: "100%", height: 350 }}>
                    <ResultPieChart violations={results.violations.length} passes={results.passes.length} incomplete={results.incomplete.length} />
                  </div>
              </ChartCard>
            </section>

            {/* SIDE-BY-SIDE INTERACTIVE AUDITOR */}
            <div className="flex flex-col lg:flex-row gap-8 items-start print:block print:space-y-0">
              
              {/* LEFT: Detailed Violations Log */}
              <div className="lg:w-1/2 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-soft border dark:border-gray-800 flex flex-col h-[750px] overflow-hidden print:h-auto print:border-none print:shadow-none print-break-page">
                <div className="p-5 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-gray-800 dark:text-white">Detailed Violations Log</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <ViolationsTable 
                    violations={results.violations} 
                    onRowClick={(v) => setActiveViolation(v)}
                    activeId={activeViolation?.id}
                  />
                </div>
              </div>

              {/* RIGHT: Visual Inspector Preview */}
              <div className="lg:w-1/2 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-soft border dark:border-gray-800 flex flex-col h-[750px] overflow-hidden print:h-auto print:border-none print:shadow-none print-break-page">
                <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-gray-800 dark:text-white">Visual Inspector Preview</h3>
                  </div>
                  {activeViolation && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-2 py-1 rounded">
                      Highlighting: {activeViolation.id}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto relative bg-white dark:bg-gray-950 p-0 inspector-report-view">
                  <VisualInspector 
                    screenshot={results.screenshot} 
                    activeViolation={activeViolation}
                  />
                  {!activeViolation && (
                    <div className="absolute inset-0 flex items-center justify-center p-8 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm z-10 text-center print:hidden">
                        <div className="space-y-3">
                            <HelpCircle className="w-12 h-12 text-blue-500 mx-auto opacity-50" />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic max-w-xs">
                              Select an issue from the log to see it highlighted on the preview.
                            </p>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PDF FOOTER */}
            <div className="hidden print:flex fixed bottom-6 right-8 text-gray-400 font-semibold text-sm items-center gap-2">
              <span>Generated by SANA Accessibility Analyzer</span>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { 
  Clock, ExternalLink, AlertCircle, X, CheckCircle, 
  AlertTriangle, Calendar, Download, FileJson, FileText, Printer 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// --- 1. HEALTH SCORE ALGORITHM ---
const calculateHealthScore = (summary) => {
  if (!summary) return 0;
  const { byImpact, totalViolations, passes } = summary;
  if (totalViolations === 0 && passes > 0) return 100;

  // Simple weighted deduction logic
  // Start at 100, deduct points for errors
  let score = 100;
  score -= (byImpact?.critical || 0) * 15;
  score -= (byImpact?.serious || 0) * 10;
  score -= (byImpact?.moderate || 0) * 5;
  score -= (byImpact?.minor || 0) * 1;

  return Math.max(0, Math.min(100, score)); // Keep between 0-100
};

// --- 2. REPORT MODAL WITH GRID & SCORE ---
function ReportModal({ scan, onClose }) {
  if (!scan) return null;

  const { byImpact, passes, incomplete, totalViolations } = scan.summary || {};
  const healthScore = calculateHealthScore(scan.summary);
  
  // Color ring logic
  const circumference = 2 * Math.PI * 40; // r=40
  const offset = circumference - (healthScore / 100) * circumference;
  const scoreColor = healthScore > 80 ? "text-green-500" : healthScore > 50 ? "text-yellow-500" : "text-red-500";

  // --- DOWNLOAD HANDLERS ---
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scan, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `accessibility_report_${scan.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDownloadCSV = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Target URL", scan.url],
      ["Scan Date", scan.formattedDate],
      ["Health Score", healthScore],
      ["Total Violations", totalViolations],
      ["Passes", passes],
      ["Critical Issues", byImpact?.critical || 0],
      ["Serious Issues", byImpact?.serious || 0],
      ["Moderate Issues", byImpact?.moderate || 0],
      ["Minor Issues", byImpact?.minor || 0],
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${scan.id}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handlePrintPDF = () => {
    window.print(); // Browser's native PDF generator (visuals included!)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-800 print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 print:hidden">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Scan Report Details
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-8 print:p-0 print:m-4">
          
          {/* TOP SECTION: URL & SCORE RING */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Left: Metadata */}
            <div className="space-y-2 flex-1">
               <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">Target Website</p>
               <a href={scan.url} className="text-xl font-bold text-gray-800 dark:text-white break-all hover:underline">
                 {scan.url}
               </a>
               <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{scan.formattedDate}</span>
               </div>
            </div>

            {/* Right: Health Score Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={offset} 
                  strokeLinecap="round"
                  className={`${scoreColor} transition-all duration-1000 ease-out`} 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-2xl font-bold ${scoreColor}`}>{healthScore}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">Score</span>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: IMPACT GRID (THE BIG CHANGE) */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Violations Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ImpactCard label="Critical" count={byImpact?.critical} color="red" />
              <ImpactCard label="Serious" count={byImpact?.serious} color="orange" />
              <ImpactCard label="Moderate" count={byImpact?.moderate} color="yellow" />
              <ImpactCard label="Minor" count={byImpact?.minor} color="blue" />
            </div>
          </div>

          {/* BOTTOM SECTION: OVERALL STATS */}
          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
             <div className="text-center">
               <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalViolations}</div>
               <div className="text-xs text-gray-500 uppercase tracking-wide">Total Issues</div>
             </div>
             <div className="text-center border-l border-r border-gray-100 dark:border-gray-800">
               <div className="text-2xl font-bold text-green-600">{passes}</div>
               <div className="text-xs text-gray-500 uppercase tracking-wide">Checks Passed</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-yellow-600">{incomplete}</div>
               <div className="text-xs text-gray-500 uppercase tracking-wide">Manual Checks</div>
             </div>
          </div>

          {/* WATERMARK (Visible mostly on Print) */}
          <div className="hidden print:block text-center mt-10 pt-10 border-t text-sm text-gray-400">
            Generated by Accessibility Analyzer (SK) • {new Date().toLocaleDateString()}
          </div>

        </div>

        {/* Modal Footer / Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap justify-end gap-3 print:hidden">
          
          {/* Download Options */}
          <button onClick={handleDownloadJSON} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
            <FileJson className="w-4 h-4" /> JSON
          </button>
          
          <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">
            <FileText className="w-4 h-4" /> CSV
          </button>

          <button onClick={handlePrintPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition shadow-sm">
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 3. HELPER COMPONENTS ---

// The "Big Number" Card
function ImpactCard({ label, count, color }) {
  const styles = {
    red: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30 text-orange-700 dark:text-orange-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400",
  };

  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${styles[color]}`}>
      <span className="text-3xl font-bold mb-1">{count || 0}</span>
      <span className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</span>
    </div>
  );
}

// Main Page (Same as before but uses updated Modal)
export default function ScanHistory() {
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    if (!user) return;

    const scansRef = collection(db, "users", user.uid, "scans");
    const q = query(scansRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedScans = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          formattedDate: data.createdAt?.toDate().toLocaleString("en-GB", {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          }) || "Just now"
        };
      });
      setScans(fetchedScans);
      setLoading(false);
    }, (error) => {
      console.error("Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 animate-pulse">Loading history...</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-6 py-10 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Scan History</h2>
        </div>

        {scans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center border border-gray-100">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800">No scans yet</h3>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft overflow-hidden border border-gray-100 dark:border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Website</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Violations</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-4 font-medium text-blue-600 truncate max-w-xs">{scan.url}</td>
                    <td className="p-4 text-gray-600 text-sm">{scan.formattedDate}</td>
                    <td className="p-4 font-mono font-bold text-gray-700">{scan.summary?.totalViolations || 0}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedScan(scan)} className="text-blue-600 hover:underline text-sm font-medium">View Report</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedScan && <ReportModal scan={selectedScan} onClose={() => setSelectedScan(null)} />}
      </div>
    </div>
  );
}
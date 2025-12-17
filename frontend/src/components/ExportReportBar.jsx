import { Download, FileText, FileJson } from "lucide-react";

export default function ExportReportBar() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-5 flex flex-col sm:flex-row gap-4 justify-between items-center">
      
      {/* LEFT TEXT */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Export Accessibility Report
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Download scan results for documentation or sharing.
        </p>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium">
          <Download className="w-4 h-4" />
          PDF
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
          <FileText className="w-4 h-4" />
          CSV
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
          <FileJson className="w-4 h-4" />
          JSON
        </button>
      </div>
    </div>
  );
}

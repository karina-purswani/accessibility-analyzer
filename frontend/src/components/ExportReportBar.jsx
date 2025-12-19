import { Download, FileText, FileJson, Printer } from "lucide-react";

export default function ExportReportBar({ onPdf, onCsv, onJson }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft p-5 flex flex-col sm:flex-row gap-4 justify-between items-center border border-gray-100 dark:border-gray-800">
      
      {/* LEFT TEXT */}
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Export Accessibility Report
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Download detailed results for documentation.
        </p>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-wrap justify-center gap-3">
        <button 
          onClick={onPdf}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium shadow-md hover:shadow-lg"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>

        <button 
          onClick={onCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          CSV
        </button>

        <button 
          onClick={onJson}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm font-medium"
        >
          <FileJson className="w-4 h-4" />
          JSON
        </button>
      </div>
    </div>
  );
}
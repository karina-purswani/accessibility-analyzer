import { useState, Fragment } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import FixSuggestionPanel from "./FixSuggestionPanel";

export default function ViolationsTable({ violations, onRowClick, activeId }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!violations || violations.length === 0) {
    return (
      <div className="text-center p-10 text-gray-500 dark:text-gray-400">
        🎉 No accessibility issues detected. Great job!
      </div>
    );
  }

  const toggleExpand = (e, id) => {
    // Prevent the row click (selection) from triggering when just expanding details
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft overflow-hidden border border-transparent">
      <table className="w-full text-left border-collapse">
        {/* TABLE HEADER */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Rule</th>
            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Impact</th>
            <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Elements</th>
            <th className="p-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">Details</th>
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody>
          {violations.map((v, index) => {
            const isSelected = activeId === (v.id || index);
            
            return (
              <Fragment key={v.id || index}>
                {/* MAIN ROW */}
                <tr
                  onClick={() => onRowClick && onRowClick(v)}
                  className={`border-t cursor-pointer transition-all duration-200 
                    ${isSelected 
                      ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500" 
                      : "odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {/* RULE */}
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">
                    {v.id}
                  </td>

                  {/* IMPACT */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold
                        ${
                          v.impact === "critical"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : v.impact === "serious"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : v.impact === "moderate"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {v.impact || "minor"}
                    </span>
                  </td>

                  {/* ELEMENT COUNT */}
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold">
                      {v.nodes?.length || 0}
                    </span>
                  </td>

                  {/* EXPAND BUTTON */}
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => toggleExpand(e, v.id || index)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition p-1"
                    >
                      {expandedId === (v.id || index) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED CONTENT ROW */}
                {expandedId === (v.id || index) && (
                  <tr className={`${isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                    <td colSpan="4" className="p-6 space-y-4 border-t dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Description</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{v.description}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                          <p className="text-xs font-bold uppercase text-gray-400 mb-1">Impact</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{v.help}</p>
                        </div>
                      </div>

                      {/* AI Fix Panel */}
                      <FixSuggestionPanel violation={v} isVisible={true} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
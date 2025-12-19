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
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft overflow-hidden border border-gray-100 dark:border-gray-800">
      <table className="w-full text-left border-collapse">
        {/* TABLE HEADER */}
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rule</th>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Impact</th>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Elements</th>
            <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Details</th>
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody>
          {violations.map((v, index) => {
            // Check if this specific row is the one selected in the Visual Inspector
            const isSelected = activeId === v.id;
            
            return (
              <Fragment key={v.id || index}>
                {/* MAIN ROW */}
                <tr
                  onClick={() => onRowClick && onRowClick(v)}
                  className={`border-t cursor-pointer transition-all duration-200 
                    ${isSelected 
                      ? "bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-500/50 shadow-sm" 
                      : "odd:bg-white even:bg-gray-50/50 dark:odd:bg-gray-900 dark:even:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                >
                  {/* RULE ID */}
                  <td className="p-4 font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {v.id}
                  </td>

                  {/* IMPACT BADGE */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase
                        ${
                          v.impact === "critical"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : v.impact === "serious"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                            : v.impact === "moderate"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {v.impact || "minor"}
                    </span>
                  </td>

                  {/* ELEMENT COUNT */}
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-md text-xs font-bold">
                      {v.nodes?.length || 0}
                    </span>
                  </td>

                  {/* ACTION BUTTON */}
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => toggleExpand(e, v.id || index)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        expandedId === (v.id || index) 
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" 
                        : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {expandedId === (v.id || index) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED DETAILS AREA */}
                {expandedId === (v.id || index) && (
                  <tr className={`${isSelected ? "bg-blue-50/30 dark:bg-blue-900/10" : "bg-gray-50/80 dark:bg-gray-800/20"}`}>
                    <td colSpan="4" className="p-6 border-t dark:border-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Problem Description</p>
                          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{v.description}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Why it matters</p>
                          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{v.help}</p>
                        </div>
                      </div>

                      {/* AI Fix Section */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <FixSuggestionPanel violation={v} isVisible={true} />
                      </div>
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
import { useState, Fragment } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import FixSuggestionPanel from "./FixSuggestionPanel";

export default function ViolationsTable({ violations }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!violations || violations.length === 0) {
    return (
      <div className="text-center p-10 text-gray-500 dark:text-gray-400">
        🎉 No accessibility issues detected. Great job!
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft overflow-hidden">
      <table className="w-full text-left">
        {/* TABLE HEADER */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="p-4">Rule</th>
            <th className="p-4">Impact</th>
            <th className="p-4">Elements</th>
            <th className="p-4 text-right">Details</th>
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody>
          {violations.map((v, index) => (
            /* ✅ FIX: Used <Fragment> with a key instead of <>. 
               The 'key' must always be on the outermost element returned by map().
            */
            <Fragment key={v.id || index}>
              <tr
                className="border-t odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
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
                          ? "bg-red-100 text-red-700"
                          : v.impact === "serious"
                          ? "bg-orange-100 text-orange-700"
                          : v.impact === "moderate"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {v.impact || "minor"}
                  </span>
                </td>

                {/* ELEMENT COUNT */}
                <td className="p-4 text-gray-600 dark:text-gray-300">
                  {v.nodes?.length || 0}
                </td>

                {/* EXPAND BUTTON */}
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleExpand(v.id || index)}
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    {expandedId === (v.id || index) ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </button>
                </td>
              </tr>

              {/* EXPANDED ROW */}
              {expandedId === (v.id || index) && (
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td colSpan="4" className="p-6 space-y-4">
                    {/* DESCRIPTION */}
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Description:</strong> {v.description}
                    </p>

                    {/* HELP TEXT */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Why it matters:</strong> {v.help}
                    </p>

                    {/* AI FIX PANEL (UI ONLY) */}
                    <FixSuggestionPanel violation={v} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
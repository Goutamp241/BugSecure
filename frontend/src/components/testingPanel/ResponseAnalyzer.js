import React, { useState } from "react";

const severityUi = {
  Critical: {
    icon: "🔥",
    cls: "border-red-500/40 bg-red-600/15 text-red-200",
    badge: "bg-red-600/30 text-red-200 border-red-500/40",
  },
  High: {
    icon: "⛔",
    cls: "border-orange-500/40 bg-orange-600/15 text-orange-200",
    badge: "bg-orange-600/30 text-orange-200 border-orange-500/40",
  },
  Medium: {
    icon: "⚠",
    cls: "border-yellow-500/40 bg-yellow-600/15 text-yellow-100",
    badge: "bg-yellow-600/30 text-yellow-100 border-yellow-500/40",
  },
};

const ResponseAnalyzer = ({ issues }) => {
  const [expandedId, setExpandedId] = useState("");
  const list = Array.isArray(issues) ? issues : [];

  if (list.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3">
        <div className="text-sm text-gray-400">
          Response Analyzer: no obvious vulnerability signals detected.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-3 space-y-2">
      <div className="text-sm font-semibold text-gray-200">⚠ Detected Issues:</div>
      {list.map((item, idx) => {
        const id = `${item.type}-${idx}`;
        const ui = severityUi[item.severity] || severityUi.Medium;
        const open = expandedId === id;
        return (
          <div key={id} className={`rounded-lg border p-3 ${ui.cls}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-sm break-words">
                  {ui.icon} [{item.severity}] {item.type}
                </div>
                <div className="text-xs mt-1 break-words">{item.message}</div>
              </div>
              <div className="flex items-center gap-2">
                {typeof item.confidence === "number" ? (
                  <span className={`text-[11px] border rounded px-2 py-1 ${ui.badge}`}>
                    {item.confidence}% conf.
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? "" : id)}
                  className="text-[11px] px-2 py-1 rounded border border-gray-600 bg-gray-800/50 hover:bg-gray-700/60 transition"
                >
                  {open ? "Hide" : "Details"}
                </button>
              </div>
            </div>

            {open ? (
              <div className="mt-2 text-xs text-gray-100/90 space-y-1">
                {item.why ? <div><span className="font-semibold">Why:</span> {item.why}</div> : null}
                {item.suggestedFix ? (
                  <div><span className="font-semibold">Suggested Fix:</span> {item.suggestedFix}</div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default ResponseAnalyzer;


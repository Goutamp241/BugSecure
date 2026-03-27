import React, { useMemo, useState } from "react";

const fmtTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const HistoryPanel = ({
  history,
  testCases,
  onLoadHistory,
  onLoadTestCase,
  onSaveTestCase,
  onDeleteTestCase,
  onDeleteHistoryItem,
}) => {
  const [tab, setTab] = useState("history"); // history | cases
  const [caseName, setCaseName] = useState("");

  const safeHistory = history || [];
  const safeCases = testCases || [];

  const topHistory = useMemo(() => safeHistory.slice(0, 10), [safeHistory]);
  const topCases = useMemo(() => safeCases.slice(0, 10), [safeCases]);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-blue-400 font-bold">≋</div>
          <div className="text-lg font-bold">History & Test Cases</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition border ${
              tab === "history"
                ? "bg-blue-600/20 border-blue-500/40 text-white"
                : "bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-700/45"
            }`}
          >
            History ({safeHistory.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("cases")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition border ${
              tab === "cases"
                ? "bg-blue-600/20 border-blue-500/40 text-white"
                : "bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-700/45"
            }`}
          >
            Test Cases ({safeCases.length})
          </button>
        </div>
      </div>

      <div className="p-4 md:p-5">
        {tab === "history" ? (
          <div className="space-y-3">
            {topHistory.length === 0 ? (
              <div className="text-gray-400 text-sm">No history yet. Send a request to start building your test set.</div>
            ) : null}
            {topHistory.map((item) => (
              <div key={item.id} className="bg-gray-900/30 border border-gray-700 rounded-xl p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-bold text-sm truncate">
                      {item.method} {item.fullUrlPreview || item.endpoint}
                    </div>
                    <div className="text-gray-400 text-xs mt-1 break-all">{fmtTime(item.createdAt)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onLoadHistory && onLoadHistory(item)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                    >
                      Reload
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem && onDeleteHistoryItem(item.id)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-sm font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-3">
              <div className="text-white font-bold text-sm mb-2">Save current request</div>
              <input
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Test case name (e.g., SQLi - login endpoint)"
              />
              <button
                type="button"
                onClick={() => {
                  onSaveTestCase && onSaveTestCase(caseName);
                  setCaseName("");
                }}
                className="mt-2 w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                Save as Test Case
              </button>
            </div>

            {topCases.length === 0 ? (
              <div className="text-gray-400 text-sm">No saved test cases yet. Save one after crafting an attack request.</div>
            ) : null}
            {topCases.map((tc) => (
              <div key={tc.id} className="bg-gray-900/30 border border-gray-700 rounded-xl p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-bold text-sm truncate">{tc.name}</div>
                    <div className="text-gray-400 text-xs mt-1 break-all">{fmtTime(tc.createdAt)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onLoadTestCase && onLoadTestCase(tc)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTestCase && onDeleteTestCase(tc.id)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-sm font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;


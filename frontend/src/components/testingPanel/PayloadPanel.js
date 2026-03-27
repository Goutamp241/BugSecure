import React, { useMemo } from "react";

const categories = [
  {
    id: "xss",
    label: "XSS",
    icon: "✶",
    payloads: ["<script>alert(1)</script>", "\"'><img src=x onerror=alert(1)>", "%3Csvg%20onload%3Dalert(1)%3E"],
  },
  {
    id: "sqli",
    label: "SQL Injection",
    icon: "⟠",
    payloads: ["' OR 1=1 --", "'; WAITFOR DELAY '0:0:2' --", "\" OR \"1\"=\"1\" -- "],
  },
  {
    id: "auth",
    label: "Authentication Bypass",
    icon: "⟐",
    payloads: ["' OR role='admin'--", "admin'--", "Bearer eyJhbGciOi... (token tamper example)"],
  },
  {
    id: "cmd",
    label: "Command Injection",
    icon: "⌁",
    payloads: ["; id", "| whoami", "$(id)"],
  },
];

const PayloadPanel = ({ onInsert, onUseAndSend, lastUsedPayload }) => {
  const payloadItems = useMemo(() => categories, []);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-blue-400 font-bold">⟡</div>
          <div className="text-lg font-bold">Payload Library</div>
        </div>
        <div className="text-gray-400 text-xs md:text-sm">
          Click a payload to insert into the selected target.
        </div>
      </div>

      <div className="p-4 md:p-5">
        {lastUsedPayload ? (
          <div className="mb-4 text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 animate-pulse">
            Last Used Payload: <span className="font-mono">{lastUsedPayload}</span>
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payloadItems.map((c) => (
            <div key={c.id} className="bg-gray-900/30 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-blue-400 font-bold">{c.icon}</div>
                  <div className="text-white font-bold">{c.label}</div>
                </div>
              </div>
              <div className="space-y-2">
                {c.payloads.map((p, idx) => (
                  <div
                    key={idx}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 transition text-sm hover:bg-gray-700/80"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onInsert && onInsert(p)}
                        className="flex-1 text-left"
                        title="Insert into active field"
                      >
                        <span className="text-gray-200 font-mono text-xs">{p}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUseAndSend && onUseAndSend(p)}
                        className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition whitespace-nowrap"
                        title="Insert and send request"
                      >
                        Use & Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-gray-400 text-xs">
          Auto-suggest scope and payloads are mocked in this v1 UI. Replace with endpoint-based suggestions later.
        </div>
      </div>
    </div>
  );
};

export default PayloadPanel;


import React, { useMemo, useState } from "react";

const tryPrettyJson = (txt) => {
  if (!txt) return null;
  const trimmed = txt.trim();
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return null;
  }
};

const looksSuspicious = (body) => {
  if (!body) return false;
  const t = body.toLowerCase();
  return (
    t.includes("sql") ||
    t.includes("syntax error") ||
    t.includes("mysql") ||
    t.includes("postgres") ||
    t.includes("unterminated") ||
    t.includes("warning:")
  );
};

const ResponseViewer = ({ response }) => {
  const [tab, setTab] = useState("body"); // body | headers | preview
  const res = response || null;

  const statusMeta = useMemo(() => {
    if (!res) return null;
    const code = res.statusCode || 0;
    let cls = "bg-gray-700 text-gray-200";
    if (code >= 200 && code < 300) cls = "bg-green-600/25 text-green-200 border-green-600/30";
    else if (code >= 400) cls = "bg-red-600/25 text-red-200 border-red-600/30";
    else if (code >= 300) cls = "bg-yellow-600/25 text-yellow-200 border-yellow-600/30";
    return { code, cls };
  }, [res]);

  const pretty = useMemo(() => {
    if (!res?.body) return null;
    return tryPrettyJson(res.body) || null;
  }, [res]);

  const suspicious = useMemo(() => looksSuspicious(res?.body || ""), [res]);

  const headerLines = useMemo(() => {
    const h = res?.headers || {};
    const keys = Object.keys(h);
    keys.sort();
    return keys.map((k) => `${k}: ${h[k]}`);
  }, [res]);

  const renderBody = () => {
    if (!res) return <div className="text-gray-400 text-sm">Send a request to see response data.</div>;
    if (tab === "headers") {
      return (
        <pre className="bg-black rounded border border-gray-700 p-3 font-mono text-xs text-gray-200 whitespace-pre-wrap overflow-x-auto">
          {headerLines.join("\n")}
        </pre>
      );
    }

    if (tab === "preview") {
      // HTML preview is unsafe; we only render plaintext preview here.
      const maybeHtml = (res?.headers?.["content-type"] || "").includes("text/html");
      return (
        <pre className="bg-black rounded border border-gray-700 p-3 font-mono text-xs text-gray-200 whitespace-pre-wrap overflow-x-auto">
          {maybeHtml ? (res.body || "").slice(0, 800) + "\n...[truncated preview]" : "Not an HTML response (preview unavailable)."}
        </pre>
      );
    }

    const bodyToShow = pretty || res.body || "";
    return (
      <pre className={`bg-black rounded border p-3 font-mono text-xs whitespace-pre-wrap overflow-x-auto ${suspicious ? "border-red-600/30" : "border-gray-700"}`}>
        {bodyToShow}
      </pre>
    );
  };

  return (
    <div className="space-y-4">
      {res ? (
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-gray-400 text-xs md:text-sm">Status</div>
            <div className={`mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusMeta?.cls || ""}`}>
              <div className="text-sm font-bold">HTTP</div>
              <div className="text-lg font-extrabold">{statusMeta?.code ?? res.statusCode}</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-2 bg-gray-700/30 border border-gray-700 rounded-lg">
              <div className="text-gray-400 text-xs">Time</div>
              <div className="font-bold">{res.durationMs} ms</div>
            </div>
            <div className="px-3 py-2 bg-gray-700/30 border border-gray-700 rounded-lg">
              <div className="text-gray-400 text-xs">Size</div>
              <div className="font-bold">{res.responseSizeBytes} bytes</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">No response yet.</div>
      )}

      <div className="flex gap-2 flex-wrap">
        {["body", "headers", "preview"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition border ${
              tab === t ? "bg-blue-600/20 border-blue-500/40 text-white" : "bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-700/45"
            }`}
          >
            {t === "body" ? "Body" : t === "headers" ? "Headers" : "Preview"}
          </button>
        ))}

        {res ? (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(res.body || "");
              } catch {
                // ignore
              }
            }}
            className="px-3 py-2 rounded-lg text-sm font-semibold transition border bg-gray-700/30 border-gray-600 hover:bg-gray-700/45"
          >
            Copy Body
          </button>
        ) : null}
      </div>

      {res ? (
        <div className="text-xs text-gray-400">
          {res.truncated ? "Response was truncated by max size." : suspicious ? "Suspicious content detected (heuristic)." : " "}
        </div>
      ) : null}

      {renderBody()}
    </div>
  );
};

export default ResponseViewer;


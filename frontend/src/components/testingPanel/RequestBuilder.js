import React, { useMemo, useState } from "react";
import KeyValueEditor from "./KeyValueEditor";
import BodyEditor from "./BodyEditor";

const RequestBuilder = ({ value, onChange, sendLoading, onSend, onValidateJsonError, highlightedField }) => {
  const state = value || {};

  const set = (patch) => {
    onChange({ ...state, ...patch });
  };

  const endpoint = (state.endpoint || "").toString();

  const method = (state.method || "GET").toString();

  const urlPreview = state.fullUrlPreview || "";

  const bodyType = state.bodyType || "json";

  const [activeBodyEditor, setActiveBodyEditor] = useState(false);

  const prettyHint = useMemo(() => {
    if (bodyType !== "json") return "";
    if (!state.bodyRaw) return "";
    const looksLikeJson = state.bodyRaw.trim().startsWith("{") || state.bodyRaw.trim().startsWith("[");
    return looksLikeJson ? "Tip: Use “Format JSON” to pretty-print." : "";
  }, [bodyType, state.bodyRaw]);

  return (
    <div className="space-y-5">
      {/* Method + URL */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-3 items-start rounded-lg p-2 transition ${
          highlightedField === "url" ? "ring-2 ring-yellow-400/70 bg-yellow-500/5" : ""
        }`}
      >
        <div>
          <label className="block text-gray-300 text-sm mb-1">Method</label>
          <select
            value={method}
            onChange={(e) => {
              set({ method: e.target.value });
            }}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-300 text-sm mb-1">Endpoint / URL</label>
          <input
            value={endpoint}
            onChange={(e) => set({ endpoint: e.target.value })}
            placeholder="/v1/users or https://api.example.com/v1/users"
            className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="mt-2 text-gray-400 text-xs break-all">
            Full URL:{" "}
            <span className="text-gray-200">
              {urlPreview || (endpoint ? "(set base URL above)" : "—")}
            </span>
          </div>
        </div>
      </div>

      {/* Headers */}
      <div
        className={`rounded-lg p-2 transition ${
          highlightedField === "header" ? "ring-2 ring-yellow-400/70 bg-yellow-500/5" : ""
        }`}
      >
        <KeyValueEditor
          title="Headers"
          icon="H"
          placeholderKey="Content-Type"
          items={state.headers || []}
          onChange={(next) => set({ headers: next })}
        />
      </div>

      {/* Query params */}
      <div
        className={`rounded-lg p-2 transition ${
          highlightedField === "query" ? "ring-2 ring-yellow-400/70 bg-yellow-500/5" : ""
        }`}
      >
        <KeyValueEditor
          title="Query Params"
          icon="?"
          placeholderKey="limit"
          items={state.queryParams || []}
          onChange={(next) => set({ queryParams: next })}
        />
      </div>

      {/* Body */}
      <div
        className={`rounded-lg p-2 transition ${
          highlightedField === "body" ? "ring-2 ring-yellow-400/70 bg-yellow-500/5" : ""
        }`}
      >
        <BodyEditor
          bodyType={bodyType}
          bodyRaw={state.bodyRaw || ""}
          bodyFields={state.bodyFields || []}
          onChange={(next) => {
            set(next);
            if (bodyType === "json") onValidateJsonError("");
          }}
          onJsonFormatError={onValidateJsonError}
          activeBodyEditor={activeBodyEditor}
          setActiveBodyEditor={setActiveBodyEditor}
        />
      </div>

      {/* Timeout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 text-sm mb-1">Timeout (ms)</label>
          <input
            type="number"
            min={1000}
            max={120000}
            value={state.timeoutMs ?? 20000}
            onChange={(e) => set({ timeoutMs: parseInt(e.target.value || "20000", 10) })}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Max Response Bytes</label>
          <input
            type="number"
            min={1024}
            max={10000000}
            value={state.maxResponseBytes ?? 2000000}
            onChange={(e) => set({ maxResponseBytes: parseInt(e.target.value || "2000000", 10) })}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>
      </div>

      {prettyHint ? <div className="text-gray-400 text-xs">{prettyHint}</div> : null}

      <button
        type="button"
        onClick={onSend}
        disabled={sendLoading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sendLoading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default RequestBuilder;


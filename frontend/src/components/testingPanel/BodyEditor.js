import React, { useMemo, useState } from "react";
import KeyValueEditor from "./KeyValueEditor";

const BodyEditor = ({
  bodyType,
  bodyRaw,
  bodyFields,
  onChange,
  onJsonFormatError,
  activeBodyEditor,
  setActiveBodyEditor,
}) => {
  const type = bodyType || "json";

  const [jsonError, setJsonError] = useState("");

  const prettyLabel = useMemo(() => {
    if (type === "json") return "JSON";
    if (type === "form-data") return "Form-data";
    if (type === "x-www-form-urlencoded") return "x-www-form-urlencoded";
    return "Raw";
  }, [type]);

  const formatJson = () => {
    setJsonError("");
    if (!bodyRaw || !bodyRaw.trim()) return;
    try {
      const parsed = JSON.parse(bodyRaw);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange({ bodyType: "json", bodyRaw: formatted });
      onJsonFormatError && onJsonFormatError("");
    } catch (e) {
      const msg = "Invalid JSON. " + (e?.message ? e.message : "");
      setJsonError(msg);
      onJsonFormatError && onJsonFormatError(msg);
    }
  };

  const setType = (nextType) => {
    setJsonError("");
    onJsonFormatError && onJsonFormatError("");
    onChange({ bodyType: nextType });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <span className="text-blue-400 font-bold">≋</span> Body
          </h3>
          <div className="text-gray-400 text-xs mt-1">Edit request payload. Use tabs for different formats.</div>
        </div>
        {type === "json" ? (
          <button
            type="button"
            onClick={formatJson}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
          >
            Format JSON
          </button>
        ) : null}
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {[
          { id: "json", label: "JSON" },
          { id: "form-data", label: "Form-data" },
          { id: "x-www-form-urlencoded", label: "x-www-form-urlencoded" },
          { id: "raw", label: "Raw" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition border ${
              type === t.id ? "bg-blue-600/20 border-blue-500/40 text-white" : "bg-gray-700/30 border-gray-600 text-gray-200 hover:bg-gray-700/45"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {type === "json" || type === "raw" ? (
        <div>
          <textarea
            value={bodyRaw || ""}
            onChange={(e) => onChange({ bodyRaw: e.target.value })}
            onFocus={() => setActiveBodyEditor && setActiveBodyEditor(true)}
            onBlur={() => setActiveBodyEditor && setActiveBodyEditor(false)}
            className="w-full p-3 rounded-lg bg-black text-white font-mono text-xs border border-gray-700 focus:ring-2 focus:ring-blue-500"
            rows={12}
            placeholder={type === "json" ? "{ \"key\": \"value\" }" : "Raw body text..."}
          />
          {jsonError ? <div className="mt-2 text-red-300 text-sm">{jsonError}</div> : null}
        </div>
      ) : (
        <KeyValueEditor
          title={type === "form-data" ? "Form Fields" : "Encoded Fields"}
          icon={type === "form-data" ? "⧉" : "⟐"}
          placeholderKey={type === "form-data" ? "field" : "key"}
          items={bodyFields || []}
          onChange={(next) => onChange({ bodyFields: next })}
        />
      )}
      <div className="mt-3 text-gray-400 text-xs">Current format: {prettyLabel}</div>
    </div>
  );
};

export default BodyEditor;


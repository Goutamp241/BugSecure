import React from "react";

const KeyValueEditor = ({
  title,
  icon,
  placeholderKey,
  items,
  onChange,
}) => {
  const rows = items || [];

  const addRow = () => {
    onChange([
      ...rows,
      { id: "row_" + Math.random().toString(16).slice(2), key: "", value: "", enabled: false },
    ]);
  };

  const toggleRow = (id) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const setField = (id, patch) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id) => {
    const next = rows.filter((r) => r.id !== id);
    onChange(next.length ? next : [{ id: "row_" + Math.random().toString(16).slice(2), key: "", value: "", enabled: false }]);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {icon ? <div className="text-blue-400 font-bold">{icon}</div> : null}
          <h3 className="text-white font-bold">{title}</h3>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
        >
          + Add
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:items-center">
            <div className="md:col-span-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!r.enabled}
                  onChange={() => toggleRow(r.id)}
                />
              </label>
            </div>

            <div className="md:col-span-5">
              <input
                value={r.key}
                onChange={(e) => setField(r.id, { key: e.target.value })}
                placeholder={placeholderKey}
                className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-6">
              <input
                value={r.value}
                onChange={(e) => setField(r.id, { value: e.target.value })}
                placeholder="value"
                className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="md:col-span-0 md:justify-self-end">
              <button
                type="button"
                onClick={() => removeRow(r.id)}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                aria-label="Remove row"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyValueEditor;


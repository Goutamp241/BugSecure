import React from "react";

const CheckboxGroup = ({
  label,
  options,
  selected,
  onChange,
  helperText,
}) => {
  const selectedSet = new Set(selected || []);

  const toggle = (id) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  return (
    <div>
      {label && (
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <label className="font-medium text-gray-300 text-sm md:text-base">
            {label}
          </label>
          {helperText ? <span className="text-gray-400 text-xs">{helperText}</span> : null}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(options || []).map((opt) => {
          const isChecked = selectedSet.has(opt.id);
          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                isChecked
                  ? "bg-blue-600/15 border-blue-500/40"
                  : "bg-gray-700/30 border-gray-600"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(opt.id)}
                className="mt-1"
              />
              <div>
                <div className="text-white font-semibold text-sm md:text-base">
                  {opt.label}
                </div>
                {opt.helper ? (
                  <div className="text-gray-400 text-xs mt-1">{opt.helper}</div>
                ) : null}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default CheckboxGroup;


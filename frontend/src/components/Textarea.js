import React from "react";

const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  helperText,
  rows = 5,
}) => {
  return (
    <div>
      {label && (
        <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
          {label}
          {required ? <span className="text-red-400 ml-1">*</span> : null}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
      />
      {helperText ? (
        <p className="text-gray-400 text-xs md:text-sm mt-2">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Textarea;


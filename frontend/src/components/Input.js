import React from "react";

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  helperText,
  disabled,
}) => {
  return (
    <div>
      {label && (
        <label className="block mb-2 font-medium text-gray-300 text-sm md:text-base">
          {label}
          {required ? <span className="text-red-400 ml-1">*</span> : null}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full p-2 md:p-3 rounded-lg bg-gray-700 text-white placeholder:text-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed"
      />
      {helperText ? (
        <p className="text-gray-400 text-xs md:text-sm mt-2">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;


import React from "react";

const SectionCard = ({ title, icon, children, helperText }) => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-sm">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-start gap-3">
          {icon && <div className="mt-0.5">{icon}</div>}
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-bold text-blue-400">{title}</h2>
            {helperText && <p className="text-gray-400 text-sm mt-1">{helperText}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default SectionCard;


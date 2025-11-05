import React from "react";

export default function MetricCard({ label, value, color, onClick }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`p-6 rounded-lg shadow text-white ${color} ${
        clickable ? "cursor-pointer hover:opacity-90 outline-none" : ""
      }`}
      aria-label={clickable ? `${label} (view details)` : label}
    >
      <p className="text-sm uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-bold mt-2">{value ?? "-"}</h3>
      {clickable && (
        <p className="mt-1 text-xs opacity-90">Press Enter to open details</p>
      )}
    </div>
  );
}

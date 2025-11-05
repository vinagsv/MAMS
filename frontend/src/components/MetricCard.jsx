import React, { useState, useEffect } from "react";
export default function MetricCard({ label, value, color, onClick }) {
  return (
    <div
      className={`p-6 rounded-lg shadow text-white cursor-pointer hover:opacity-90 transition ${color}`}
      onClick={onClick}
    >
      <p className="text-sm uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-bold mt-2">{value ?? "-"}</h3>
    </div>
  );
}

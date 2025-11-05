// src/components/Dashboard/DashboardFilters.jsx
import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function DashboardFilters({ filters, setFilters, bases = [] }) {
  const [equipmentList, setEquipmentList] = useState([]);

  // Load active equipment list
  useEffect(() => {
    api
      .get("/equipment")
      .then((r) => setEquipmentList(r.data || []))
      .catch(() => console.error("Failed to load equipment list"));
  }, []);

  const renderBaseOptions = () =>
    bases
      .filter((b) => b && (b._id || b.name))
      .map((b, i) => {
        const key = b._id ?? i;
        const name = b.name ?? b;
        return (
          <option key={key} value={name}>
            {name}
          </option>
        );
      });

  const renderEquipmentOptions = () =>
    equipmentList
      .filter((eq) => eq && eq.name)
      .map((eq, i) => (
        <option key={eq._id || i} value={eq.name}>
          {eq.name}
        </option>
      ));

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Dashboard Filters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Base Dropdown */}
        <select
          value={filters.base}
          onChange={(e) => setFilters({ ...filters, base: e.target.value })}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Bases</option>
          {renderBaseOptions()}
        </select>

        {/* Equipment Dropdown */}
        <select
          value={filters.equipment}
          onChange={(e) =>
            setFilters({ ...filters, equipment: e.target.value })
          }
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Equipment</option>
          {renderEquipmentOptions()}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Date To */}
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

// src/components/Assignments/AssignmentForm.jsx
import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function AssignmentForm({ bases = [], onSuccess }) {
  const [form, setForm] = useState({
    base: "",
    personnel: "",
    equipment: "",
    quantity: "",
    type: "assigned",
  });
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load active equipment
  useEffect(() => {
    api
      .get("/equipment")
      .then((r) => setEquipmentList(r.data || []))
      .catch(() => alert("Failed to load equipment"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipment) return alert("Please select equipment");
    setLoading(true);
    try {
      await api.post("/assignments", form);
      setForm({
        base: "",
        personnel: "",
        equipment: "",
        quantity: "",
        type: "assigned",
      });
      onSuccess();
    } catch {
      alert("Error creating assignment");
    } finally {
      setLoading(false);
    }
  };

  const renderBaseOptions = () =>
    bases
      .filter((b) => b && (b._id || b.name)) // Prevent null/undefined
      .map((b, i) => {
        const key = b._id ?? i;
        const name = b.name ?? b;
        return (
          <option key={key} value={name}>
            {name}
          </option>
        );
      });

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow mb-8"
    >
      {/* Base Dropdown */}
      <select
        value={form.base}
        onChange={(e) => setForm({ ...form, base: e.target.value })}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Base</option>
        {renderBaseOptions()}
      </select>

      {/* Personnel */}
      <input
        type="text"
        placeholder="Personnel / Purpose"
        value={form.personnel}
        onChange={(e) => setForm({ ...form, personnel: e.target.value })}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* Equipment Dropdown */}
      <select
        value={form.equipment}
        onChange={(e) => setForm({ ...form, equipment: e.target.value })}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Equipment</option>
        {equipmentList
          .filter((eq) => eq && eq._id && eq.name)
          .map((eq) => (
            <option key={eq._id} value={eq.name}>
              {eq.name}
            </option>
          ))}
      </select>

      {/* Quantity */}
      <input
        type="number"
        placeholder="Quantity"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* Type */}
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="assigned">Assigned</option>
        <option value="expended">Expended</option>
      </select>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Recording..." : "Record"}
      </button>
    </form>
  );
}

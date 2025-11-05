import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function PurchaseForm({ bases, onSuccess }) {
  const [form, setForm] = useState({
    date: "",
    base: "",
    equipment: "",
    quantity: "",
    supplier: "",
    cost: "",
  });
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load active equipment on mount
  useEffect(() => {
    api
      .get("/equipment")
      .then((r) => setEquipmentList(r.data))
      .catch(() => alert("Failed to load equipment list"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipment) return alert("Please select equipment");
    setLoading(true);
    try {
      await api.post("/purchases", form);
      setForm({
        date: "",
        base: "",
        equipment: "",
        quantity: "",
        supplier: "",
        cost: "",
      });
      onSuccess();
    } catch {
      alert("Failed to create purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-4 rounded shadow"
    >
      {/* Base */}
      <select
        value={form.base}
        onChange={(e) => setForm({ ...form, base: e.target.value })}
        required
        className="border rounded p-2"
      >
        <option value="">Select Base</option>
        {bases.map((b) => (
          <option key={b._id || b.name} value={b.name}>
            {b.name}
          </option>
        ))}
      </select>

      {/* Equipment Dropdown */}
      <select
        value={form.equipment}
        onChange={(e) => setForm({ ...form, equipment: e.target.value })}
        required
        className="border rounded p-2"
      >
        <option value="">Select Equipment</option>
        {equipmentList.map((eq) => (
          <option key={eq._id} value={eq.name}>
            {eq.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Quantity"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        required
        className="border rounded p-2"
      />
      <input
        type="text"
        placeholder="Supplier"
        value={form.supplier}
        onChange={(e) => setForm({ ...form, supplier: e.target.value })}
        className="border rounded p-2"
      />
      <input
        type="number"
        placeholder="Cost"
        value={form.cost}
        onChange={(e) => setForm({ ...form, cost: e.target.value })}
        className="border rounded p-2"
      />
      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        className="border rounded p-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Purchase"}
      </button>
    </form>
  );
}

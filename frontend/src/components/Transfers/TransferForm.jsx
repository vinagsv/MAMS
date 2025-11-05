import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function TransferForm({ bases, onSuccess }) {
  const [form, setForm] = useState({
    from: "",
    to: "",
    equipment: "",
    quantity: "",
  });
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load active equipment
  useEffect(() => {
    api
      .get("/equipment")
      .then((r) => setEquipmentList(r.data))
      .catch(() => alert("Failed to load equipment"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipment) return alert("Please select equipment");
    setLoading(true);
    try {
      await api.post("/transfers", form);
      setForm({ from: "", to: "", equipment: "", quantity: "" });
      onSuccess();
    } catch {
      alert("Error initiating transfer");
    } finally {
      setLoading(false);
    }
  };

  const renderBaseOptions = () =>
    bases.map((b, i) => {
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
      <select
        value={form.from}
        onChange={(e) => setForm({ ...form, from: e.target.value })}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">From Base</option>
        {renderBaseOptions()}
      </select>

      <select
        value={form.to}
        onChange={(e) => setForm({ ...form, to: e.target.value })}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">To Base</option>
        {renderBaseOptions()}
      </select>

      {/* Equipment Dropdown */}
      <select
        value={form.equipment}
        onChange={(e) => setForm({ ...form, equipment: e.target.value })}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
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
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Initiating..." : "Initiate Transfer"}
      </button>
    </form>
  );
}

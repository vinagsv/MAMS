import React, { useState } from "react";
import api from "../../utils/api";

export default function EquipmentForm({ onCreated }) {
  const [form, setForm] = useState({ name: "", category: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Equipment name required");
    try {
      setLoading(true);
      await api.post("/equipment", form);
      setForm({ name: "", category: "" });
      onCreated?.();
    } catch (err) {
      alert("Failed to create equipment type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Equipment Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="rounded border p-2"
      />
      <input
        type="text"
        placeholder="Category (optional)"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="rounded border p-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

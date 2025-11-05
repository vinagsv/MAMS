import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import EquipmentForm from "./EquipmentForm";

export default function EquipmentList({ user }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/equipment");
      setEquipment(data);
    } catch (err) {
      setError("Failed to load equipment types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.patch(`/equipment/${id}/toggle`);
      fetchEquipment();
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">
          Equipment Types
        </h2>
        {user?.role === "admin" && <EquipmentForm onCreated={fetchEquipment} />}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <div className="rounded bg-red-50 p-3 text-red-700">{error}</div>
      ) : equipment.length === 0 ? (
        <p className="text-gray-500">No equipment types found.</p>
      ) : (
        <table className="min-w-full border rounded shadow-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq) => (
              <tr key={eq._id} className="border-t">
                <td className="p-2">{eq.name}</td>
                <td className="p-2">{eq.category || "-"}</td>
                <td className="p-2">
                  {eq.active ? (
                    <span className="rounded bg-green-100 px-2 py-1 text-green-700 text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="rounded bg-red-100 px-2 py-1 text-red-700 text-xs">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="p-2 text-right">
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleToggle(eq._id)}
                      className={`rounded px-3 py-1 text-sm font-medium ${
                        eq.active
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {eq.active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

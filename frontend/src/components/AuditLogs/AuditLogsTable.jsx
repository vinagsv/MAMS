import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function AuditLogsTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user: "",
    action: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      ).toString();

      const { data } = await api.get(`/logs?${q}`);
      setLogs(data);
    } catch {
      alert("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const formatDetails = (details) => {
    if (!details) return "-";
    let parsed;
    try {
      parsed = JSON.parse(details);
    } catch {
      return details;
    }

    const { body } = parsed;
    if (!body || typeof body !== "object" || Object.keys(body).length === 0)
      return "-";

    return (
      <div className="space-y-0.5">
        {Object.entries(body).map(([key, value]) => (
          <div key={key} className="text-gray-700">
            <span className="font-medium capitalize">{key}:</span>{" "}
            {String(value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Audit Logs</h2>

      {/* Filter bar */}
      <form onSubmit={handleFilter} className="flex flex-wrap gap-2">
        <input
          type="text"
          name="user"
          placeholder="User"
          value={filters.user}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="text"
          name="action"
          placeholder="Action"
          value={filters.action}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Filter
        </button>
      </form>

      {/* Logs table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No logs found.</p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left w-1/6">Timestamp</th>
                <th className="p-2 text-left w-1/6">User</th>
                <th className="p-2 text-left w-1/6">Action</th>
                <th className="p-2 text-left w-3/6">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">{log.user}</td>
                  <td className="p-2">{log.action}</td>
                  <td className="p-2 align-top">
                    {formatDetails(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

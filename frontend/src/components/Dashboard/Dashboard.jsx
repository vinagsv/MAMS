import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Package,
  Truck,
  ClipboardList,
  Target,
  ShoppingCart,
  Info,
} from "lucide-react";

import api from "../../utils/api";
import DashboardFilters from "./DashboardFilters";
import NetMovementDrilldownModal from "./NetMovementDrilldownModal";

export default function Dashboard({ filters, setFilters, bases }) {
  const [metrics, setMetrics] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [recent, setRecent] = useState([]);

  // Load Dashboard Metrics & Details

  useEffect(() => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    ).toString();

    Promise.all([
      api.get(`/dashboard/metrics?${q}`),
      api.get(`/dashboard/details?${q}`),
    ])
      .then(([m, d]) => {
        setMetrics(m.data);

        const combined = [
          ...(d.data.purchases || []).slice(0, 3).map((x) => ({
            type: "Purchase",
            name: x.equipment,
            base: x.base,
            qty: x.quantity,
            date: x.date,
          })),
          ...(d.data.transfersIn || []).slice(0, 3).map((x) => ({
            type: "Transfer In",
            name: x.equipment,
            base: x.to,
            qty: x.quantity,
            date: x.date,
          })),
          ...(d.data.transfersOut || []).slice(0, 3).map((x) => ({
            type: "Transfer Out",
            name: x.equipment,
            base: x.from,
            qty: x.quantity,
            date: x.date,
          })),
        ]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setRecent(combined);
      })
      .catch(() => setMetrics(null));
  }, [filters]);

  // Drilldown (View Details Modal)

  const handleDrillDown = async () => {
    try {
      setLoadingDetails(true);
      const q = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      ).toString();
      const res = await api.get(`/dashboard/details?${q}`);
      setDetailData(res.data);
      setShowDetails(true);
    } catch {
      alert("Failed to load details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!metrics) {
    return (
      <div className="bg-white p-10 rounded-lg shadow text-center mt-10">
        <p className="text-gray-500 text-lg">
          Loading data or no records found for selected filters.
        </p>
      </div>
    );
  }

  const trendUp = metrics.netMovement > 0;

  const chartData = [
    { name: "Purchased", value: metrics.totalPurchased || 0 },
    { name: "Transfer In", value: metrics.transferIn || 0 },
    { name: "Transfer Out", value: -metrics.transferOut || 0 },
    { name: "Assigned", value: -metrics.totalAssigned || 0 },
    { name: "Expended", value: -metrics.totalExpended || 0 },
  ];

  const MetricCard = ({ icon: Icon, label, value, color, trend }) => (
    <div
      className={`bg-white border rounded-2xl shadow p-6 flex items-center gap-4 hover:shadow-lg transition transform hover:-translate-y-1`}
    >
      <div className={`${color} text-white p-3 rounded-full`}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-gray-500 text-sm font-medium">{label}</span>
        <span className="text-2xl font-bold">{value || 0}</span>
        {trend !== undefined && (
          <span
            className={`text-sm flex items-center gap-1 ${
              trend ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend ? "Increase" : "Decrease"}
          </span>
        )}
      </div>
    </div>
  );

  // Render

  return (
    <div className="relative">
      <DashboardFilters
        filters={filters}
        setFilters={setFilters}
        bases={bases}
      />

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <MetricCard
          label="Opening Balance"
          value={metrics.openingBalance}
          color="bg-gray-600"
          icon={Package}
        />
        <MetricCard
          label="Closing Balance"
          value={metrics.closingBalance}
          color="bg-green-600"
          icon={ClipboardList}
          trend={metrics.closingBalance >= metrics.openingBalance}
        />
        <MetricCard
          label="Net Movement"
          value={metrics.netMovement}
          color="bg-blue-600"
          icon={Activity}
          trend={trendUp}
        />
        <MetricCard
          label="Purchased"
          value={metrics.totalPurchased}
          color="bg-indigo-600"
          icon={ShoppingCart}
        />
        <MetricCard
          label="Assigned"
          value={metrics.totalAssigned}
          color="bg-yellow-600"
          icon={Target}
        />
        <MetricCard
          label="Expended"
          value={metrics.totalExpended}
          color="bg-red-600"
          icon={Truck}
        />
      </div>

      {/* Net Movement Overview with "View Details" Button */}
      <div className="bg-white mt-8 p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            Net Movement Overview
          </h3>

          <button
            onClick={handleDrillDown}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Info size={16} />
            View Details
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Movements Section */}
      <div className="bg-white mt-8 p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Recent Movements
        </h3>
        <div className="divide-y">
          {recent.length > 0 ? (
            recent.map((r, i) => (
              <div key={i} className="py-3 flex justify-between text-sm">
                <div>
                  <span className="font-semibold">{r.type}</span> —{" "}
                  <span className="text-gray-700">{r.name}</span>
                  <span className="text-gray-500">
                    {" "}
                    ({r.qty} units @ {r.base})
                  </span>
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(r.date).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent activity.</p>
          )}
        </div>
      </div>

      {/* Net Movement Modal */}
      <NetMovementDrilldownModal
        show={showDetails}
        onClose={() => setShowDetails(false)}
        loading={loadingDetails}
        data={detailData}
      />
    </div>
  );
}

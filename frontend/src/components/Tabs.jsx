import React from "react";

export default function Tabs({ activeTab, setActiveTab, user }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* Dashboard*/}
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`px-4 py-2 rounded transition ${
          activeTab === "dashboard"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Dashboard
      </button>

      {/* Purchases */}
      {(user?.role === "admin" || user?.role === "logistics") && (
        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2 rounded transition ${
            activeTab === "purchases"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Purchases
        </button>
      )}

      {/* Transfers */}
      {(user?.role === "admin" || user?.role === "logistics") && (
        <button
          onClick={() => setActiveTab("transfers")}
          className={`px-4 py-2 rounded transition ${
            activeTab === "transfers"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Transfers
        </button>
      )}

      {/* Assignments */}
      {(user?.role === "admin" ||
        user?.role === "logistics" ||
        user?.role === "commander") && (
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2 rounded transition ${
            activeTab === "assignments"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Assignments
        </button>
      )}

      {/* Equipment (Admin Only) */}
      {user?.role === "admin" && (
        <button
          onClick={() => setActiveTab("equipment")}
          className={`px-4 py-2 rounded transition ${
            activeTab === "equipment"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Equipment
        </button>
      )}

      {/* Audit Logs (Admin Only) */}
      {user?.role === "admin" && (
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded transition ${
            activeTab === "logs"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Audit Logs
        </button>
      )}

      {/* Users (Admin Only) */}
      {user?.role === "admin" && (
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded transition ${
            activeTab === "users"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Users
        </button>
      )}
    </div>
  );
}

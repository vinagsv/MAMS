import React, { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import api from "./utils/api";
import { useAuth } from "./hooks/useAuth";

import Login from "./components/Login";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Dashboard from "./components/Dashboard/Dashboard";
import PurchaseForm from "./components/Purchases/PurchaseForm";
import PurchasesTable from "./components/Purchases/PurchasesTable";
import TransferForm from "./components/Transfers/TransferForm";
import TransfersTable from "./components/Transfers/TransfersTable";
import AssignmentForm from "./components/Assignments/AssignmentForm";
import AssignmentsTable from "./components/Assignments/AssignmentsTable";
import AuditLogsTable from "./components/AuditLogs/AuditLogsTable";
import EquipmentList from "./components/Equipment/EquipmentList";
import UserManagement from "./components/Users/UserManagement";

export default function App() {
  const { token, user, bases, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loadingBackend, setLoadingBackend] = useState(true);

  const [filters, setFilters] = useState({
    base: "",
    equipment: "",
    dateFrom: "",
    dateTo: "",
  });

  const [purchases, setPurchases] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [logs, setLogs] = useState([]);

  // Health check (always runs, not conditionally returned)
  useEffect(() => {
    let interval;
    const checkHealth = async () => {
      try {
        const res = await api.get("/health");
        if (res.status === 200) {
          console.log("✅ Backend ready");
          setLoadingBackend(false);
          clearInterval(interval);
        }
      } catch {
        console.log("⏳ Backend still waking up...");
      }
    };

    checkHealth();
    interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  // Load tab data
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        if (activeTab === "purchases") {
          const { data } = await api.get("/purchases");
          setPurchases(data);
        } else if (activeTab === "transfers") {
          const { data } = await api.get("/transfers");
          setTransfers(data);
        } else if (activeTab === "assignments") {
          const { data } = await api.get("/assignments");
          setAssignments(data);
        } else if (activeTab === "logs" && user?.role === "admin") {
          const { data } = await api.get("/logs");
          setLogs(data);
        }
      } catch (err) {
        console.error("⚠️ Data fetch error:", err);
      }
    };

    loadData();
  }, [token, activeTab, user]);

  // conditional rendering (not early returns with hooks)
  return (
    <div className="min-h-screen bg-gray-100">
      {loadingBackend ? (
        <LoadingScreen />
      ) : !token ? (
        <Login onLogin={login} />
      ) : (
        <>
          <Header user={user} onLogout={logout} />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

          <main className="p-6 transition-all duration-500">
            {activeTab === "dashboard" && (
              <Dashboard
                filters={filters}
                setFilters={setFilters}
                bases={bases}
              />
            )}

            {activeTab === "purchases" &&
              (user?.role === "admin" || user?.role === "logistics") && (
                <>
                  <PurchaseForm
                    bases={bases}
                    onSuccess={() =>
                      api.get("/purchases").then((r) => setPurchases(r.data))
                    }
                  />
                  <PurchasesTable data={purchases} />
                </>
              )}

            {activeTab === "transfers" &&
              (user?.role === "admin" || user?.role === "logistics") && (
                <>
                  <TransferForm
                    bases={bases}
                    onSuccess={() =>
                      api.get("/transfers").then((r) => setTransfers(r.data))
                    }
                  />
                  <TransfersTable data={transfers} />
                </>
              )}

            {activeTab === "assignments" && (
              <>
                <AssignmentForm
                  bases={bases}
                  onSuccess={() =>
                    api.get("/assignments").then((r) => setAssignments(r.data))
                  }
                />
                <AssignmentsTable data={assignments} />
              </>
            )}

            {activeTab === "logs" && user?.role === "admin" && (
              <AuditLogsTable data={logs} />
            )}

            {activeTab === "equipment" && user?.role === "admin" && (
              <EquipmentList user={user} />
            )}

            {activeTab === "users" && user?.role === "admin" && (
              <UserManagement />
            )}
          </main>
        </>
      )}
    </div>
  );
}

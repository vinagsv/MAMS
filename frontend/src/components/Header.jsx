import React, { useState, useEffect } from "react";

export default function Header({ user, onLogout }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Military Asset Management System
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Logged in as: <strong>{user?.email}</strong> ({user?.role})
        </span>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

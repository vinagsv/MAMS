import React, { useState, useEffect } from "react";
export default function TransfersTable({ data }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">From</th>
            <th className="py-2 px-4 text-left">To</th>
            <th className="py-2 px-4 text-left">Equipment</th>
            <th className="py-2 px-4 text-left">Quantity</th>
            <th className="py-2 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t._id} className="border-t hover:bg-gray-50">
              <td className="py-2 px-4">{t.from}</td>
              <td className="py-2 px-4">{t.to}</td>
              <td className="py-2 px-4">{t.equipment}</td>
              <td className="py-2 px-4">{t.quantity}</td>
              <td className="py-2 px-4">{t.status || "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

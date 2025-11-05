import React, { useState, useEffect } from "react";

export default function PurchasesTable({ data }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">Base</th>
            <th className="py-2 px-4 text-left">Equipment</th>
            <th className="py-2 px-4 text-left">Quantity</th>
            <th className="py-2 px-4 text-left">Supplier</th>
            <th className="py-2 px-4 text-left">Cost</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p._id} className="border-t hover:bg-gray-50">
              <td className="py-2 px-4">{p.base}</td>
              <td className="py-2 px-4">{p.equipment}</td>
              <td className="py-2 px-4">{p.quantity}</td>
              <td className="py-2 px-4">{p.supplier}</td>
              <td className="py-2 px-4">₹{p.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

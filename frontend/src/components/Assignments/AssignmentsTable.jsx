import React, { useState } from "react";

export default function AssignmentsTable({ data }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-2 px-4 text-left">Base</th>
            <th className="py-2 px-4 text-left">Personnel</th>
            <th className="py-2 px-4 text-left">Equipment</th>
            <th className="py-2 px-4 text-left">Quantity</th>
            <th className="py-2 px-4 text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a) => (
            <tr key={a._id} className="border-t hover:bg-gray-50">
              <td className="py-2 px-4">{a.base}</td>
              <td className="py-2 px-4">{a.personnel}</td>
              <td className="py-2 px-4">{a.equipment}</td>
              <td className="py-2 px-4">{a.quantity}</td>
              <td className="py-2 px-4 capitalize">{a.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

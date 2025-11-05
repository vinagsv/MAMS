import React, { useMemo, useState } from "react";

function exportCSV(filename, headers, rows, mapCells) {
  if (!Array.isArray(rows)) return;
  const header = headers.join(",");
  const lines = rows.map((r) =>
    mapCells(r)
      .map((c) => {
        const val = c ?? "";
        const escaped = String(val).replace(/"/g, '""');
        return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
      })
      .join(",")
  );
  const blob = new Blob([header + "\n" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function NetMovementDrilldownModal({
  show,
  onClose,
  loading,
  data,
}) {
  const [query, setQuery] = useState("");

  if (!show) return null;

  // Default empty data structure to prevent undefined access
  const safeData = {
    purchases: data?.purchases || [],
    transfersIn: data?.transfersIn || [],
    transfersOut: data?.transfersOut || [],
    assigned: data?.assigned || [],
    expended: data?.expended || [],
    totals: data?.totals || {},
  };

  // Simple search filter
  const filter = (rows) => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      Object.values(r || {}).some((v) =>
        v ? String(v).toLowerCase().includes(q) : false
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-6xl max-h-[88vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-gray-500 hover:text-gray-800"
        >
          ×
        </button>

        <div className="mb-4 flex flex-wrap items-center gap-3 pr-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            Net Movement Details
          </h2>
          <input
            type="text"
            placeholder="Quick search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ml-auto w-full max-w-sm rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500">Loading details…</p>
        ) : (
          <>
            <Section
              title="Purchases"
              color="blue"
              headers={["Base", "Equipment", "Quantity", "Date", "Supplier"]}
              rows={filter(safeData.purchases)}
              mapCells={(p) => [
                p?.base || "-",
                p?.equipment || "-",
                p?.quantity ?? "-",
                p?.date ? new Date(p.date).toLocaleDateString() : "-",
                p?.supplier || "-",
              ]}
              onExport={() =>
                exportCSV(
                  "purchases.csv",
                  ["Base", "Equipment", "Quantity", "Date", "Supplier"],
                  safeData.purchases,
                  (p) => [
                    p?.base,
                    p?.equipment,
                    p?.quantity,
                    p?.date ? new Date(p.date).toLocaleDateString() : "",
                    p?.supplier,
                  ]
                )
              }
            />

            <Section
              title="Transfers In"
              color="green"
              headers={["From", "To", "Equipment", "Quantity"]}
              rows={filter(safeData.transfersIn)}
              mapCells={(t) => [
                t?.from || "-",
                t?.to || "-",
                t?.equipment || "-",
                t?.quantity ?? "-",
              ]}
              onExport={() =>
                exportCSV(
                  "transfers_in.csv",
                  ["From", "To", "Equipment", "Quantity"],
                  safeData.transfersIn,
                  (t) => [t?.from, t?.to, t?.equipment, t?.quantity]
                )
              }
            />

            <Section
              title="Transfers Out"
              color="red"
              headers={["From", "To", "Equipment", "Quantity"]}
              rows={filter(safeData.transfersOut)}
              mapCells={(t) => [
                t?.from || "-",
                t?.to || "-",
                t?.equipment || "-",
                t?.quantity ?? "-",
              ]}
              onExport={() =>
                exportCSV(
                  "transfers_out.csv",
                  ["From", "To", "Equipment", "Quantity"],
                  safeData.transfersOut,
                  (t) => [t?.from, t?.to, t?.equipment, t?.quantity]
                )
              }
            />

            <Section
              title="Assigned Equipment"
              color="purple"
              headers={["Base", "Equipment", "Quantity", "Date", "Remarks"]}
              rows={filter(safeData.assigned)}
              mapCells={(a) => [
                a?.base || "-",
                a?.equipment || "-",
                a?.quantity ?? "-",
                a?.date ? new Date(a.date).toLocaleDateString() : "-",
                a?.remarks || "-",
              ]}
            />

            <Section
              title="Expended Equipment"
              color="orange"
              headers={["Base", "Equipment", "Quantity", "Date", "Remarks"]}
              rows={filter(safeData.expended)}
              mapCells={(e) => [
                e?.base || "-",
                e?.equipment || "-",
                e?.quantity ?? "-",
                e?.date ? new Date(e.date).toLocaleDateString() : "-",
                e?.remarks || "-",
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}

//  Section + Table Components
function Section({ title, color, headers, rows, mapCells, onExport }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-3">
        <h3 className={`text-lg font-semibold text-${color}-700`}>{title}</h3>
        <span className="ml-auto text-sm text-gray-600">
          Total: <b>{rows?.length || 0}</b>
        </span>
        {onExport && (
          <button
            onClick={onExport}
            className="rounded bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-900"
          >
            Export CSV
          </button>
        )}
      </div>

      <Table headers={headers} rows={rows} mapCells={mapCells} />
    </div>
  );
}

function Table({ headers, rows = [], mapCells }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-2 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((r, i) => (
              <tr key={r?._id || i} className="border-t">
                {mapCells(r).map((c, j) => (
                  <td key={j} className="p-2 text-gray-700">
                    {c}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="p-2 text-center text-gray-500"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

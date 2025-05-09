"use client";

import type React from "react";
import type { Table } from "../types";
import { Users } from "lucide-react";

interface TablesProps {
  tables: Table[];
  updateTableStatus: (tableId: string, newStatus: Table["status"]) => void;
}

const Tables: React.FC<TablesProps> = ({ tables, updateTableStatus }) => {
  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusOptions = (currentStatus: Table["status"]) => {
    const allStatuses: Table["status"][] = [
      "available",
      "occupied",
      "reserved",
    ];
    return allStatuses.filter((status) => status !== currentStatus);
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Tables</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold mb-5">
                    Table {table.number}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    table.status
                  )}`}
                >
                  {table.status}
                </span>
                <span className="mt-1 text-sm text-gray-500">
                  {table.capacity} seats
                </span>
                <div className="mt-3">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        updateTableStatus(
                          table.id,
                          e.target.value as Table["status"]
                        );
                        e.target.value = "";
                      }
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-1 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  >
                    <option value="">Change status</option>
                    {getStatusOptions(table.status).map((status) => (
                      <option key={status} value={status}>
                        Mark as {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tables;

"use client";

import React, { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { X } from "lucide-react";
import type { Table } from "../types";

interface TablesProps {
  tables: Table[];
  updateTableStatus: (tableId: string, newStatus: Table["status"]) => void;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "served" | "paid";
}

interface JwtPayload {
  id: string;
  role: string;
  exp: number;
}

const mockOrders: Record<string, Order> = {
  "table-1": {
    id: "order-1",
    items: [
      { id: "item-1", name: "Margherita Pizza", quantity: 1, price: 12.99 },
      { id: "item-2", name: "Caesar Salad", quantity: 2, price: 8.99 },
      { id: "item-3", name: "Sparkling Water", quantity: 3, price: 3.99 },
    ],
    total: 42.94,
    status: "preparing",
  },
  "table-2": {
    id: "order-2",
    items: [
      { id: "item-4", name: "Pasta Carbonara", quantity: 2, price: 14.99 },
      { id: "item-5", name: "Garlic Bread", quantity: 1, price: 5.99 },
      { id: "item-6", name: "Red Wine", quantity: 1, price: 9.99 },
    ],
    total: 45.96,
    status: "served",
  },
};

const Tables: React.FC<TablesProps> = ({ tables, updateTableStatus }) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Decode JWT token
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let userRole: string | null = null;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      userRole = decoded.role;
    } catch (err) {
      console.error("Nevaljan token:", err);
    }
  }

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "text-green-500";
      case "occupied":
        return "text-red-500";
      case "reserved":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getOrderStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "served":
        return "bg-purple-100 text-purple-800";
      case "paid":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTableOrder = (tableId: string): Order | null => {
    return mockOrders[tableId] || null;
  };

  const handleViewOrder = (tableId: string) => {
    setSelectedTable(tableId);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closePopup = () => {
    setSelectedTable(null);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        const isButtonClick = Object.values(buttonRefs.current).some(
          (btn) => btn && btn.contains(event.target as Node)
        );

        if (!isButtonClick) {
          closePopup();
        }
      }
    };

    if (selectedTable) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTable]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    if (selectedTable) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [selectedTable]);

  return (
    <div className="relative">
      <div className="flex justify-between">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Tables</h2>

        {(userRole === "1" || userRole === "3") && (
          <div className="mb-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg shadow">
              + Add Table
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold mb-2">
                    Table {table.number}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium ${getStatusColor(
                    table.status
                  )}`}
                >
                  {table.status}
                </span>
                <div className="mt-3 w-full">
                  <button
                    ref={(el) => {
                      buttonRefs.current[table.id] = el;
                    }}
                    onClick={() => handleViewOrder(table.id)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                    disabled={table.status === "available"}
                  >
                    {table.status === "available" ? "No Order" : "View Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={closePopup}
          />
          <div
            ref={popupRef}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Table {tables.find((t) => t.id === selectedTable)?.number}{" "}
                  Order
                </h3>
                <button
                  onClick={closePopup}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {(() => {
                const order = getTableOrder(selectedTable);

                if (!order) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No order found.</p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="mb-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-xs text-gray-500 uppercase tracking-wider mb-3">
                        Order Items
                      </h4>
                      <ul className="divide-y divide-gray-100">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="py-3 flex justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              ${item.price.toFixed(2)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center font-medium">
                        <p className="text-base text-gray-900">Total</p>
                        <p className="text-base text-gray-900 font-bold">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="w-full bg-gray-900 text-white py-2.5 px-4 text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-all">
                        Update Status
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;

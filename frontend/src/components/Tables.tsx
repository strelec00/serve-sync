"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import type { Table } from "../types";
import { X } from "lucide-react";

interface TablesProps {
  tables: Table[];
  updateTableStatus: (tableId: string, newStatus: Table["status"]) => void;
}

// Sample order type - adjust based on your actual data structure
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
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  // Handle click on view order button
  const handleViewOrder = (tableId: string) => {
    const buttonElement = buttonRefs.current[tableId];

    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Position the popup above the button
      setPopupPosition({
        top: rect.top + scrollTop - 10, // Position above the button with a small gap
        left: rect.left + rect.width / 2, // Center horizontally with the button
      });
    }

    setSelectedTable(tableId);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popup = document.getElementById("order-popup");
      if (popup && !popup.contains(event.target as Node)) {
        // Check if the click was on a button
        const isButtonClick = Object.values(buttonRefs.current).some(
          (btn) => btn && btn.contains(event.target as Node)
        );

        if (!isButtonClick) {
          setSelectedTable(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
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
                  <span className="text-xl font-bold mb-3">
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
                <span className="mt-1 text-sm text-gray-500">
                  {table.capacity} seats
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

      {/* Simple Popup */}
      {selectedTable && (
        <div
          id="order-popup"
          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 w-80 z-50 animate-fadeIn"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            transform: "translate(-50%, -100%)", // Center horizontally and position above
          }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Table {tables.find((t) => t.id === selectedTable)?.number} Order
              </h3>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {(() => {
              const order = getTableOrder(selectedTable);

              if (!order) {
                return (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No order found.</p>
                  </div>
                );
              }

              return (
                <>
                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <h4 className="font-medium text-xs text-gray-500 mb-1">
                      ORDER ITEMS
                    </h4>
                    <ul className="divide-y divide-gray-100">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="py-1.5 flex justify-between"
                        >
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-xs font-medium text-gray-900">
                            ${item.price.toFixed(2)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center font-medium">
                      <p className="text-sm text-gray-900">Total</p>
                      <p className="text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button className="w-full bg-gray-100 text-gray-700 border border-gray-300 py-1.5 px-3 text-xs rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all">
                      Update Status
                    </button>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Popup arrow */}
          <div className="absolute left-1/2 bottom-0 w-3 h-3 bg-white border-b border-r border-gray-200 transform translate-y-1.5 rotate-45 -translate-x-1.5"></div>
        </div>
      )}
    </div>
  );
};

export default Tables;

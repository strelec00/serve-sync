"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import type { Table } from "../types";

interface TablesProps {
  tables: Table[];
  updateTableStatus: (tableId: string, newStatus: Table["status"]) => void;
  userRole: string | null; // ✅ Added this
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
  status: "ordered" | "preparing" | "readytoserve" | "served";
  foodType?: "eggs" | "bananas";
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
    foodType: "eggs",
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
    foodType: "bananas",
  },
};

const Tables: React.FC<TablesProps> = ({
  tables,
  updateTableStatus,
  userRole,
}) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableOrders, setTableOrders] =
    useState<Record<string, Order>>(mockOrders);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [currentTableForOrder, setCurrentTableForOrder] = useState<
    string | null
  >(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const popupRef = useRef<HTMLDivElement | null>(null);
  const orderPopupRef = useRef<HTMLDivElement | null>(null);

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "free":
        return "text-green-500";
      case "occupied":
        return "text-red-500";
      case "reserved":
        return "text-yellow-500";
      case "available":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getTableOrder = (tableId: string): Order | null => {
    return tableOrders[tableId] || null;
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

  const openOrderModal = (tableId: string) => {
    setCurrentTableForOrder(tableId);
    setOrderModalOpen(true);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeOrderModal = () => {
    setCurrentTableForOrder(null);
    setOrderModalOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  };

  const placeOrder = (tableId: string, foodType: "eggs" | "bananas") => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      items: [
        {
          id: `item-${Date.now()}`,
          name: foodType === "eggs" ? "Eggs" : "Bananas",
          quantity: 1,
          price: foodType === "eggs" ? 5.99 : 3.99,
        },
      ],
      total: foodType === "eggs" ? 5.99 : 3.99,
      status: "ordered",
      foodType: foodType,
    };

    setTableOrders((prev) => ({
      ...prev,
      [tableId]: newOrder,
    }));

    // Update table status to occupied
    const tableToUpdate = tables.find((t) => t.id === tableId);
    if (tableToUpdate && tableToUpdate.status !== "occupied") {
      updateTableStatus(tableId, "occupied");
    }

    closeOrderModal();
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

      if (
        orderModalOpen &&
        orderPopupRef.current &&
        !orderPopupRef.current.contains(event.target as Node)
      ) {
        closeOrderModal();
      }
    };

    if (selectedTable || orderModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTable, orderModalOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedTable) closePopup();
        if (orderModalOpen) closeOrderModal();
      }
    };

    if (selectedTable || orderModalOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [selectedTable, orderModalOpen]);

  return (
    <div className="relative">
      <div className="flex justify-between">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Tables</h2>

        <div className="mb-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg shadow">
            + Add Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => {
          const hasOrder = !!getTableOrder(table.id);
          return (
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
                    {table.status === "available" ? "free" : table.status}
                  </span>
                  <div className="mt-3 w-full">
                    {table.status === "occupied" || hasOrder ? (
                      <button
                        ref={(el) => {
                          buttonRefs.current[table.id] = el;
                        }}
                        onClick={() => handleViewOrder(table.id)}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                      >
                        View Order
                      </button>
                    ) : (
                      <button
                        onClick={() => openOrderModal(table.id)}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                      >
                        Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tables;

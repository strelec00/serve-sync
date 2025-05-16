"use client";

import type React from "react";
import { useRef, useState } from "react";
import type { Table, Order } from "../types";

interface TablesProps {
  tables: Table[];
  orders: Order[];
  updateTableStatus: (tableId: number, newStatus: Table["status"]) => void;
}

// Mapa enum vrijednosti ako dolazi kao broj iz backenda
const statusMap: Record<number | string, string> = {
  0: "Ordered",
  1: "Preparing",
  2: "ReadyToServe",
  3: "Served",
  Ordered: "Ordered",
  Preparing: "Preparing",
  ReadyToServe: "ReadyToServe",
  Served: "Served",
};

// Formatiranje camel case stringova za čitljiv prikaz
const formatStatus = (status: number | string): string => {
  const raw = statusMap[status] ?? String(status);
  return raw.replace(/([A-Z])/g, " $1").trim();
};

const Tables: React.FC<TablesProps> = ({
  tables,
  orders,
  updateTableStatus,
}) => {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTableOrder = (tableId: number): Order | undefined =>
    orders.find((order) => order.tableId === tableId);

  const handleViewOrder = (tableId: number) => {
    const order = getTableOrder(tableId);
    if (order) {
      setSelectedOrder(order);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Sort order items by orderItemId to maintain consistent order
  const getSortedOrderItems = (orderItems: Order["orderItems"]) => {
    return [...orderItems].sort((a, b) => a.orderItemId - b.orderItemId);
  };
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
          const order = getTableOrder(table.tableId);
          const hasOrder = !!order;

          return (
            <div
              key={table.tableId}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold mb-2">
                    Table {table.tableId}
                  </span>

                  <div className="mt-3 w-full">
                    {table.status === "Occupied" || hasOrder ? (
                      <button
                        ref={(el) => {
                          buttonRefs.current[table.tableId] = el;
                        }}
                        onClick={() => handleViewOrder(table.tableId)}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                      >
                        View Order
                      </button>
                    ) : (
                      <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ease-in-out">
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

      {/* Order Items Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Table {selectedOrder.tableId}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-sm text-gray-500">
                  Order #{selectedOrder.orderId}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {formatStatus(selectedOrder.status)}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto flex-grow p-5">
              {selectedOrder.orderItems &&
              selectedOrder.orderItems.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Order Items</h4>
                  <ul className="divide-y">
                    {getSortedOrderItems(selectedOrder.orderItems).map(
                      (item) => (
                        <li
                          key={item.orderItemId}
                          className="py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium">
                                {item.menuItem
                                  ? item.menuItem.name
                                  : "Unknown Item"}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-700 font-medium">
                                x{item.quantity}
                              </span>
                            </div>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-300 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-gray-500">No items in this order</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;

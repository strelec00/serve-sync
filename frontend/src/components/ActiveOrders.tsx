"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { Order, OrderStatus } from "../types";
import { CheckCircle, ChefHat, Utensils, AlertCircle } from "lucide-react";

interface ActiveOrdersProps {
  orders: Order[];
  updateOrderStatus: (orderId: number, newStatus: number) => void;
  onOrderStatusChanged?: () => void;
}

const orderStatusLabels: Record<number, string> = {
  0: "Ordered",
  1: "Preparing",
  2: "ReadyToServe",
  3: "Served",
};

const ActiveOrders: React.FC<ActiveOrdersProps> = ({
  orders: initialOrders,
  updateOrderStatus,
  onOrderStatusChanged,
}) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});

  // Listen for order updates from Tables component
  useEffect(() => {
    const handleOrdersUpdated = (event: CustomEvent<Order[]>) => {
      if (event.detail) {
        console.log("Orders updated event received:", event.detail.length);
        setOrders(event.detail);

        // Notify parent component that order status has changed
        if (onOrderStatusChanged) {
          onOrderStatusChanged();
        }
      }
    };

    // Add event listener
    window.addEventListener(
      "ordersUpdated",
      handleOrdersUpdated as EventListener
    );

    // Clean up
    return () => {
      window.removeEventListener(
        "ordersUpdated",
        handleOrdersUpdated as EventListener
      );
    };
  }, [onOrderStatusChanged]);

  // Update orders when initialOrders prop changes
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 0: // Ordered
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 1: // Preparing
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2: // ReadyToServe
        return "bg-green-100 text-green-800 border-green-200";
      case 3: // Served
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case 0: // Ordered
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 1: // Preparing
        return <ChefHat className="h-5 w-5 text-yellow-500" />;
      case 2: // ReadyToServe
        return <Utensils className="h-5 w-5 text-green-500" />;
      case 3: // Served
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (statusId: number) => {
    switch (statusId) {
      case 0: // Ordered
        return "New Order";
      case 1: // Preparing
        return "In Kitchen";
      case 2: // ReadyToServe
        return "Waiting for Waiter...";
      case 3: // Served
        return "Served to Table";
      default:
        return orderStatusLabels[statusId] || "Unknown";
    }
  };

  const getButtonConfig = (statusId: number) => {
    switch (statusId) {
      case 0: // Ordered
        return {
          show: true,
          text: "In Progress",
          nextStatus: 1, // Preparing
          className: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        };
      case 1: // Preparing
        return {
          show: true,
          text: "Ready to Serve",
          nextStatus: 2, // ReadyToServe
          className: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
        };
      case 2: // ReadyToServe
        return {
          show: false,
          text: "Waiting for Waiter",
          nextStatus: null, // Served
          className: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        };

      default:
        return {
          show: false,
          text: "",
          nextStatus: null,
          className: "",
        };
    }
  };

  // Function to update order status in the database
  const handleStatusUpdate = async (orderId: number, newStatus: number) => {
    // Set updating state for this order
    setIsUpdating((prev) => ({ ...prev, [orderId]: true }));

    try {
      // First update the UI optimistically
      updateOrderStatus(orderId, newStatus);

      // Update local state - Fix: Cast the number to OrderStatus
      const updatedOrders = orders.map((order) =>
        order.orderId === orderId
          ? { ...order, status: newStatus as unknown as OrderStatus }
          : order
      );

      setOrders(updatedOrders);

      // Dispatch a custom event to notify other components about the updated orders
      const event = new CustomEvent("ordersUpdated", { detail: updatedOrders });
      window.dispatchEvent(event);

      // Then update the database
      const response = await fetch(
        `http://localhost:5123/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update order status in database");
        // If the API call fails, revert the UI update
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, status: order.status }
              : order
          )
        );
      } else {
        // Notify parent component that order status has changed
        if (onOrderStatusChanged) {
          onOrderStatusChanged();
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      // Clear updating state
      setIsUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Sort orders by status (Ordered first, then Preparing, then ReadyToServe)
  const sortedOrders = [...orders].sort((a, b) => {
    const statusA = Number.parseInt(a.status.toString());
    const statusB = Number.parseInt(b.status.toString());
    return statusA - statusB;
  });

  return (
    <div className=" rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Active Orders</h2>

      {sortedOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active orders at the moment
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedOrders.map((order) => {
            const statusId = Number.parseInt(order.status.toString());
            const buttonConfig = getButtonConfig(statusId);
            const statusColorClass = getStatusColor(statusId);
            const itemCount = order.orderItems?.length || 0;

            return (
              <div
                key={order.orderId}
                className={`bg-white overflow-hidden shadow-md rounded-lg border ${
                  statusColorClass.includes("border")
                    ? statusColorClass.split(" ")[2]
                    : "border-gray-200"
                } transition-all duration-200 hover:shadow-lg flex flex-col h-full`}
              >
                <div className="px-6 py-5 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        Table {order.tableId}
                      </span>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          statusId
                        )}`}
                      >
                        {getStatusText(statusId)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.name &&
                      order.name !== `Table ${order.tableId} Order`
                        ? order.name
                        : ""}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-500">
                        Order Items:
                      </h3>
                      {itemCount > 4 && (
                        <span className="text-xs text-gray-400">
                          Scroll to see all {itemCount} items
                        </span>
                      )}
                    </div>

                    {/* Fixed height container with scrolling for more than 4 items */}
                    <div
                      className={`${
                        itemCount > 4 ? "h-[168px]" : ""
                      } overflow-y-auto pr-2 custom-scrollbar`}
                    >
                      <ul className="space-y-2">
                        {order.orderItems?.map((item, index) => (
                          <li
                            key={item.orderItemId || index}
                            className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-md"
                          >
                            <span className="font-medium">
                              {item.menuItem?.name ||
                                `Item #${item.menuItemId}`}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-200 rounded-md text-sm font-medium">
                              {item.quantity}x
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Static footer with status and action button */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(statusId)}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {getStatusText(statusId)}
                    </span>
                  </div>

                  {buttonConfig.show && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          order.orderId,
                          buttonConfig.nextStatus!
                        )
                      }
                      disabled={isUpdating[order.orderId]}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                        buttonConfig.className
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                        isUpdating[order.orderId] ? "opacity-75" : ""
                      }`}
                    >
                      {isUpdating[order.orderId]
                        ? "Updating..."
                        : buttonConfig.text}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;

"use client";

import type React from "react";
import type { Order, OrderStatus } from "../types";
import { Clock, CheckCircle, ServerCrash } from "lucide-react";

interface ActiveOrdersProps {
  orders: Order[];
  updateOrderStatus: (orderId: number, newStatus: OrderStatus) => void;
}

const ActiveOrders: React.FC<ActiveOrdersProps> = ({
  orders,
  updateOrderStatus,
}) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ReadyToServe":
        return "bg-green-100 text-green-800";
      case "Served":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Preparing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "ReadyToServe":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Served":
        return <ServerCrash className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case "Ordered":
        return "Preparing";
      case "Preparing":
        return "ReadyToServe";
      case "ReadyToServe":
        return "Served";
      case "Served":
        return null;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Active Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Table {order.tableId}
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Items:
                </h3>
                <ul className="space-y-1">
                  {order.orderItems?.map((item) => (
                    <li
                      key={item.orderItemId}
                      className="text-sm text-gray-700"
                    >
                      {item.menuItem?.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-1 text-sm text-gray-500">
                    {order.status === "Preparing" && "In kitchen"}
                    {order.status === "ReadyToServe" && "Ready to serve"}
                    {order.status === "Served" && "Served to table"}
                  </span>
                </div>
                {getNextStatus(order.status) && (
                  <button
                    onClick={() =>
                      updateOrderStatus(
                        order.orderId,
                        getNextStatus(order.status)!
                      )
                    }
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {order.status === "Preparing" && "Mark Ready"}
                    {order.status === "ReadyToServe" && "Mark Served"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveOrders;

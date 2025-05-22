"use client";

import type React from "react";
import { useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  type Table,
  type Order,
  TableStatus,
  type OrderStatus,
  type MenuItem,
} from "../types";
import {
  MinusIcon,
  PlusIcon,
  XIcon,
  PencilIcon,
  CheckCircle,
  AlertCircle,
  ChefHat,
  Utensils,
} from "lucide-react";

interface TablesProps {
  tables: Table[];
  orders: Order[];
  menuItems: MenuItem[];
  addTable: (t: Table) => void;
  deleteTable: (id: number) => void;
  updateTableStatus: (tableId: number, newStatus: Table["status"]) => void;
  onOrdersChanged?: () => void;
}

interface JwtPayload {
  id: string;
}

interface OrderItem {
  menuItemId: number;
  quantity: number;
}

const orderStatusLabels: Record<number, OrderStatus> = {
  0: "Ordered",
  1: "Preparing",
  2: "ReadyToServe",
  3: "Served",
};

const Tables: React.FC<TablesProps> = ({
  tables,
  orders,
  menuItems,
  addTable,
  deleteTable,
  updateTableStatus,
  onOrdersChanged,
}) => {
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [orderName, setOrderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const getTableOrder = (tableId: number) =>
    orders.find((o) => o.tableId === tableId);

  // Find the highest table ID (the "last" table)
  const getHighestTableId = () => {
    if (tables.length === 0) return 0;
    return Math.max(...tables.map((table) => table.tableId));
  };

  const handleViewOrder = (tableId: number) => {
    const o = getTableOrder(tableId);
    if (o) {
      setSelectedOrder(o);
      setIsModalOpen(true);

      // Fetch order details including items
      fetchOrderDetails(o.orderId);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const res = await fetch(`http://localhost:5123/orders/${orderId}`);
      if (!res.ok) throw new Error("Error fetching order details");

      const orderDetails = await res.json();
      setSelectedOrder(orderDetails);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedTableId(null);
    setSelectedItems([]);
    setOrderName("");
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleOpenOrderModal = (tableId: number) => {
    setSelectedTableId(tableId);
    // Initialize with all menu items at quantity 0
    setSelectedItems(
      menuItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: 0,
      }))
    );
    setIsOrderModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!selectedOrder) return;

    // Check if order is in "Preparing" or later status - prevent editing
    const orderStatus = Number.parseInt(selectedOrder.status.toString());
    if (orderStatus >= 1) {
      alert("Orders in preparation or ready to serve cannot be edited.");
      return;
    }

    // Initialize edit form with current order data
    setOrderName(selectedOrder.name || "");
    setSelectedTableId(selectedOrder.tableId);

    // Initialize with all menu items at quantity 0
    const initialItems = menuItems.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: 0,
    }));

    // Update quantities for items in the order
    if (selectedOrder.orderItems && selectedOrder.orderItems.length > 0) {
      selectedOrder.orderItems.forEach((orderItem) => {
        const index = initialItems.findIndex(
          (item) => item.menuItemId === orderItem.menuItemId
        );
        if (index !== -1) {
          initialItems[index].quantity = orderItem.quantity;
        }
      });
    }

    setSelectedItems(initialItems);
    setIsEditModalOpen(true);
    setIsModalOpen(false); // Close the view modal
  };

  const handleQuantityChange = (menuItemId: number, change: number) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.menuItemId === menuItemId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleCreateOrder = async () => {
    if (!selectedTableId) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const decoded = jwtDecode<JwtPayload>(token);
      const userId = Number.parseInt(decoded.id, 10);

      // Filter out items with quantity 0
      const orderItems = selectedItems.filter((item) => item.quantity > 0);

      if (orderItems.length === 0) {
        alert("Please select at least one item");
        setIsProcessing(false);
        return;
      }

      const orderData = {
        name: orderName || `Table ${selectedTableId} Order`,
        userId,
        tableId: selectedTableId,
        restaurantId: 1, // Assuming this is the restaurant ID
        orderItems: orderItems,
      };

      const res = await fetch("http://localhost:5123/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Error creating order");

      // Get the created order from the response
      const createdOrder = await res.json();

      // Update table status to occupied
      updateTableStatus(selectedTableId, TableStatus.Occupied);

      // Close the modal
      closeOrderModal();

      // Refresh orders from the server
      await refreshOrders();

      // Notify parent component if callback exists
      if (onOrdersChanged) {
        onOrdersChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder || !selectedTableId) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const decoded = jwtDecode<JwtPayload>(token);
      const userId = Number.parseInt(decoded.id, 10);

      // Filter out items with quantity 0
      const orderItems = selectedItems.filter((item) => item.quantity > 0);

      if (orderItems.length === 0) {
        alert("Please select at least one item");
        setIsProcessing(false);
        return;
      }

      const orderData = {
        name: orderName || `Table ${selectedTableId} Order`,
        userId,
        tableId: selectedTableId,
        status: selectedOrder.status, // Keep the current status
        orderItems: orderItems,
      };

      const res = await fetch(
        `http://localhost:5123/orders/${selectedOrder.orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!res.ok) throw new Error("Error updating order");

      // Get the updated order data from the response
      const updatedOrder = await res.json();

      // Close the edit modal
      closeEditModal();

      // Fetch the complete order details with items
      try {
        const detailsRes = await fetch(
          `http://localhost:5123/orders/${selectedOrder.orderId}`
        );
        if (!detailsRes.ok)
          throw new Error("Error fetching updated order details");

        const orderDetails = await detailsRes.json();

        // Update the selectedOrder state with the new data
        setSelectedOrder(orderDetails);

        // Reopen the view modal
        setIsModalOpen(true);

        // Refresh orders from the server
        await refreshOrders();

        // Notify parent component if callback exists
        if (onOrdersChanged) {
          onOrdersChanged();
        }
      } catch (err) {
        console.error("Failed to fetch updated order details:", err);
        // Even if fetching details fails, still show the basic updated order
        setSelectedOrder({
          ...selectedOrder,
          ...updatedOrder,
          orderItems: selectedItems.filter((item) => item.quantity > 0),
        });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTable = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const decoded = jwtDecode<JwtPayload>(token);
      const userId = Number.parseInt(decoded.id, 10);

      // Find the lowest available table ID
      const tableIds = tables
        .map((table) => table.tableId)
        .sort((a, b) => a - b);
      let lowestAvailableId = 1;

      // Find the first gap in the sequence
      for (let i = 0; i < tableIds.length; i++) {
        if (tableIds[i] !== i + 1) {
          lowestAvailableId = i + 1;
          break;
        }
        // If we've gone through all IDs without finding a gap, use the next number
        if (i === tableIds.length - 1) {
          lowestAvailableId = tableIds[i] + 1;
        }
      }

      const body = {
        tableId: lowestAvailableId, // Specify the ID we want to use
        capacity: 4,
        status: 0,
        restaurantId: 1,
        userId,
      };

      const res = await fetch("http://localhost:5123/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error adding table");

      const created: Table = await res.json();
      addTable(created);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this table?")) return;

    try {
      const res = await fetch(`http://localhost:5123/tables/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error deleting table");

      deleteTable(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinishOrder = async (orderId: number, tableId: number) => {
    if (!confirm("Mark this order as finished? This will delete the order."))
      return;
    setIsProcessing(true);

    try {
      const res = await fetch(`http://localhost:5123/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Error finishing order");

      // Update table status to free
      updateTableStatus(tableId, TableStatus.Free);

      // Update local state by filtering out the deleted order
      const updatedOrders = orders.filter((order) => order.orderId !== orderId);

      // Dispatch a custom event to notify other components about the updated orders
      const event = new CustomEvent("ordersUpdated", { detail: updatedOrders });
      window.dispatchEvent(event);

      // Refresh orders from the server (as a backup)
      await refreshOrders();
    } catch (err) {
      console.error("Error finishing order:", err);
    } finally {
      if (onOrdersChanged) {
        onOrdersChanged();
      }
      setIsProcessing(false);
    }
  };

  // Function to refresh orders from the server
  const refreshOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const ordersRes = await fetch("http://localhost:5123/orders", {
        headers,
      });
      if (!ordersRes.ok) throw new Error("Error fetching orders");

      const ordersData = await ordersRes.json();

      // Dispatch a custom event to notify other components about the updated orders
      const event = new CustomEvent("ordersUpdated", { detail: ordersData });
      window.dispatchEvent(event);

      // Notify parent component if callback exists
      if (onOrdersChanged) {
        onOrdersChanged();
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  };

  const getTotalItems = () => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get the highest table ID
  const highestTableId = getHighestTableId();

  return (
    <div className="relative">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Tables</h2>
        <button
          onClick={handleAddTable}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg shadow"
        >
          + Add Table
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => {
          const order = getTableOrder(table.tableId);
          const occupied = table.status === "Occupied" || !!order;
          const isLastTable = table.tableId === highestTableId;
          const orderStatus = order
            ? Number.parseInt(order.status.toString())
            : -1;

          // Determine border and background colors based on status
          let borderColor = "border-gray-200";
          let bgGradient = "";
          let statusIcon = null;

          if (occupied) {
            if (orderStatus === 0) {
              // Ordered - Orange
              borderColor = "border-orange-300";
              bgGradient = "bg-gradient-to-b from-orange-50 to-white";
              statusIcon = <AlertCircle className="h-4 w-4 text-orange-500" />;
            } else if (orderStatus === 1) {
              // Preparing - Yellow
              borderColor = "border-yellow-300";
              bgGradient = "bg-gradient-to-b from-yellow-50 to-white";
              statusIcon = <ChefHat className="h-4 w-4 text-yellow-500" />;
            } else if (orderStatus === 2) {
              // Ready to Serve - Green
              borderColor = "border-green-300";
              bgGradient = "bg-gradient-to-b from-green-50 to-white";
              statusIcon = <Utensils className="h-4 w-4 text-green-500" />;
            } else {
              // Served - Blue
              borderColor = "border-blue-300";
              bgGradient = "bg-gradient-to-b from-blue-50 to-white";
              statusIcon = <CheckCircle className="h-4 w-4 text-blue-500" />;
            }
          }

          return (
            <div
              key={table.tableId}
              className={`relative overflow-hidden shadow-md hover:shadow-lg rounded-lg border-2 transition-all duration-200 ${borderColor} ${bgGradient}`}
            >
              {/* Only show delete button for the last table */}
              {isLastTable && (
                <button
                  onClick={() => handleDelete(table.tableId)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full z-10 shadow-sm"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              )}

              <div className="p-4 flex flex-col items-center">
                <div className="flex items-center justify-center mb-3 w-full">
                  <span className="text-xl font-bold text-gray-800">
                    Table {table.tableId}
                  </span>
                  {statusIcon && <span className="ml-2">{statusIcon}</span>}
                </div>

                <div className="w-full text-center">
                  {occupied ? (
                    orderStatus === 2 ? (
                      // Order Ready to Serve - Show "Order Finished" button
                      <button
                        onClick={() =>
                          handleFinishOrder(order!.orderId, table.tableId)
                        }
                        disabled={isProcessing}
                        className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center justify-center transition-colors duration-200"
                      >
                        {isProcessing ? "Processing..." : "Order Finished"}
                        {!isProcessing && (
                          <CheckCircle className="ml-1 h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      // Order in other status - Show "View Order" button
                      <button
                        ref={(el: HTMLButtonElement | null) => {
                          buttonRefs.current[table.tableId] = el;
                        }}
                        onClick={() => handleViewOrder(table.tableId)}
                        className={`w-full px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                          orderStatus === 0
                            ? "bg-orange-500 hover:bg-orange-600"
                            : orderStatus === 1
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        View Order
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleOpenOrderModal(table.tableId)}
                      className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
                    >
                      Order
                    </button>
                  )}

                  {/* Order status badge */}
                  {order && (
                    <div className="mt-2">
                      <span
                        className={`text-sm px-2 py-1 rounded-full inline-flex items-center ${
                          orderStatus === 0
                            ? "bg-orange-100 text-orange-800"
                            : orderStatus === 1
                            ? "bg-yellow-100 text-yellow-800"
                            : orderStatus === 2
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {orderStatusLabels[orderStatus]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Order Details</h3>
                {Number.parseInt(selectedOrder.status.toString()) === 0 && (
                  <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Table {selectedOrder.tableId} • Status:{" "}
                {orderStatusLabels[Number.parseInt(selectedOrder.status)]}
              </p>

              {selectedOrder.orderItems &&
              selectedOrder.orderItems.length > 0 ? (
                <>
                  <div className="max-h-60 overflow-y-auto mb-4 pr-5">
                    <div className="space-y-3">
                      {selectedOrder.orderItems.map((item, index) => {
                        const menuItem = menuItems.find(
                          (m) => m.menuItemId === item.menuItemId
                        );
                        return (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-gray-100"
                          >
                            <div>
                              <p className="font-medium">
                                {menuItem?.name || `Item #${item.menuItemId}`}
                              </p>
                              {menuItem && (
                                <p className="text-sm text-gray-500">
                                  ${menuItem.price.toFixed(2)} each
                                </p>
                              )}
                            </div>
                            <div className="flex items-center">
                              <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                                {item.quantity}x
                              </span>
                              {menuItem && (
                                <span className="ml-3 font-medium">
                                  ${(menuItem.price * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>
                        $
                        {selectedOrder.orderItems
                          .reduce((total, item) => {
                            const menuItem = menuItems.find(
                              (m) => m.menuItemId === item.menuItemId
                            );
                            return (
                              total +
                              (menuItem ? menuItem.price * item.quantity : 0)
                            );
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  Loading order items...
                </div>
              )}
            </div>
            <div className="p-5 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isOrderModalOpen && selectedTableId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5">
              <h3 className="text-xl font-bold mb-4">
                Create Order for Table {selectedTableId}
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="orderName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Order Name (Optional)
                </label>
                <input
                  type="text"
                  id="orderName"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  placeholder={`Table ${selectedTableId} Order`}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                <h4 className="font-medium mb-2">Menu Items</h4>
                {menuItems.map((item) => {
                  const orderItem = selectedItems.find(
                    (i) => i.menuItemId === item.menuItemId
                  );
                  const quantity = orderItem ? orderItem.quantity : 0;

                  return (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between py-2 border-b border-gray-100 pr-5"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.menuItemId, -1)
                          }
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                          disabled={quantity === 0}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.menuItemId, 1)
                          }
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between font-medium">
                  <span>Total Items:</span>
                  <span>{getTotalItems()}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex space-x-3">
              <button
                onClick={closeOrderModal}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={getTotalItems() === 0 || isProcessing}
              >
                {isProcessing ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {isEditModalOpen && selectedOrder && selectedTableId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-5">
              <h3 className="text-xl font-bold mb-4">
                Edit Order for Table {selectedTableId}
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="editOrderName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Order Name
                </label>
                <input
                  type="text"
                  id="editOrderName"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                <h4 className="font-medium mb-2">Menu Items</h4>
                {menuItems.map((item) => {
                  const orderItem = selectedItems.find(
                    (i) => i.menuItemId === item.menuItemId
                  );
                  const quantity = orderItem ? orderItem.quantity : 0;

                  return (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between py-2 border-b border-gray-100 pr-5"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.menuItemId, -1)
                          }
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                          disabled={quantity === 0}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.menuItemId, 1)
                          }
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between font-medium">
                  <span>Total Items:</span>
                  <span>{getTotalItems()}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex space-x-3">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={getTotalItems() === 0 || isProcessing}
              >
                {isProcessing ? "Updating..." : "Update Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;

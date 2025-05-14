"use client";

import type React from "react";
import { useState } from "react";
import { LayoutDashboard, Utensils, BookOpen } from "lucide-react";
import ActiveOrders from "./components/ActiveOrders";
import Tables from "./components/Tables";
import Menu from "./components/Menu";
import LoginForm from "./components/LoginForm";
import type { Order, Table, MenuItem } from "./types";
import "./index.css";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "tables" | "menu">(
    "orders"
  );
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Sample data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      tableNumber: 3,
      items: ["Margherita Pizza", "Caesar Salad", "Coke"],
      status: "preparing",
      time: "18:30",
    },
    {
      id: "2",
      tableNumber: 5,
      items: ["Pasta Carbonara", "Garlic Bread", "Tiramisu"],
      status: "ready",
      time: "18:45",
    },
    {
      id: "3",
      tableNumber: 2,
      items: ["Chicken Burger", "Fries", "Milkshake"],
      status: "served",
      time: "19:00",
    },
    {
      id: "4",
      tableNumber: 7,
      items: ["Steak", "Mashed Potatoes", "Wine"],
      status: "preparing",
      time: "19:15",
    },
  ]);

  const [tables, setTables] = useState<Table[]>([
    { id: "1", number: 1, status: "available", capacity: 2 },
    { id: "2", number: 2, status: "occupied", capacity: 4 },
    { id: "3", number: 3, status: "occupied", capacity: 4 },
    { id: "4", number: 4, status: "reserved", capacity: 6 },
    { id: "5", number: 5, status: "occupied", capacity: 2 },
    { id: "6", number: 6, status: "available", capacity: 4 },
    { id: "7", number: 7, status: "occupied", capacity: 8 },
    { id: "8", number: 8, status: "available", capacity: 2 },
  ]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and basil",
      price: 12.99,
      category: "Main",
    },
    {
      id: "2",
      name: "Caesar Salad",
      description:
        "Romaine lettuce with Caesar dressing, croutons, and parmesan",
      price: 8.99,
      category: "Starter",
    },
    {
      id: "3",
      name: "Pasta Carbonara",
      description: "Spaghetti with creamy sauce, bacon, and parmesan",
      price: 14.99,
      category: "Main",
    },
    {
      id: "4",
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee and mascarpone",
      price: 6.99,
      category: "Dessert",
    },
    {
      id: "5",
      name: "Chicken Burger",
      description: "Grilled chicken breast with lettuce, tomato, and mayo",
      price: 10.99,
      category: "Main",
    },
    {
      id: "6",
      name: "Garlic Bread",
      description: "Toasted bread with garlic butter and herbs",
      price: 4.99,
      category: "Side",
    },
    {
      id: "7",
      name: "Steak",
      description: "Grilled ribeye steak with herb butter",
      price: 24.99,
      category: "Main",
    },
    {
      id: "8",
      name: "Cheesecake",
      description: "New York style cheesecake with berry compote",
      price: 7.99,
      category: "Dessert",
    },
  ]);

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Update table status
  const updateTableStatus = (tableId: string, newStatus: Table["status"]) => {
    setTables(
      tables.map((table) =>
        table.id === tableId ? { ...table, status: newStatus } : table
      )
    );
  };

  // Update menu item
  const updateMenuItem = (itemId: string, updatedItem: Partial<MenuItem>) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === itemId ? { ...item, ...updatedItem } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">
                  Restaurant Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={() => setShowLoginForm(true)}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("orders")}
                className={`${
                  activeTab === "orders"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Active Orders
              </button>
              <button
                onClick={() => setActiveTab("tables")}
                className={`${
                  activeTab === "tables"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <Utensils className="h-4 w-4 mr-2" />
                Tables
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`${
                  activeTab === "menu"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Menu
              </button>
            </nav>
          </div>

          <div className="p-4">
            {activeTab === "orders" && (
              <ActiveOrders
                orders={orders}
                updateOrderStatus={updateOrderStatus}
              />
            )}
            {activeTab === "tables" && (
              <Tables tables={tables} updateTableStatus={updateTableStatus} />
            )}
            {activeTab === "menu" && (
              <Menu menuItems={menuItems} updateMenuItem={updateMenuItem} />
            )}
          </div>
        </div>
      </div>

      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} />}
    </div>
  );
};

export default App;

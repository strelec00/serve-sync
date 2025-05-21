"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { LayoutDashboard, Utensils, BookOpen, UserPlus } from "lucide-react";
import ActiveOrders from "./components/ActiveOrders";
import Tables from "./components/Tables";
import Menu from "./components/Menu";
import LoginForm from "./components/LoginForm";
import type {
  Order,
  Table,
  MenuItem,
  OrderStatus,
  TableStatus,
  Category,
} from "./types";
import { jwtDecode } from "jwt-decode";

import "./index.css";
import RegisterForm from "./components/RegisterForm";

interface JwtPayload {
  id: string;
  role: string;
  exp: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "tables" | "menu">(
    "orders"
  );

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUserRole(decoded.role);
        setIsAuthenticated(true);

        if (decoded.role === "3") {
          setActiveTab("tables");
        } else {
          setActiveTab("orders");
        }
      } catch {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        // Fetch all required data (orders, tables, menuitems)
        const [ordersRes, tablesRes, menuRes, categoriesRes] =
          await Promise.all([
            fetch("http://localhost:5123/orders", { headers }),
            fetch("http://localhost:5123/tables", { headers }),
            fetch("http://localhost:5123/menuitems", { headers }),
            fetch("http://localhost:5123/categories", { headers }),
          ]);

        if (
          !ordersRes.ok ||
          !tablesRes.ok ||
          !menuRes.ok ||
          !categoriesRes.ok
        ) {
          throw new Error("Error fetching data");
        }

        const ordersData = await ordersRes.json();
        const tablesData = await tablesRes.json();
        const menuData = await menuRes.json();
        const categoriesData = await categoriesRes.json();

        setOrders(ordersData);
        setTables(tablesData);
        setMenuItems(menuData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Update functions for UI and state
  const updateOrderStatus = (orderId: number, newStatus: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId
          ? { ...order, status: newStatus as unknown as OrderStatus }
          : order
      )
    );
  };

  const updateTableStatus = (tableId: number, newStatus: TableStatus) => {
    setTables((prev) =>
      prev.map((table) =>
        table.tableId === tableId ? { ...table, status: newStatus } : table
      )
    );
  };

  const updateMenuItem = (itemId: number, updatedItem: Partial<MenuItem>) => {
    setMenuItems((prev) => {
      // If item is "deleted"
      if ((updatedItem as any).deleted) {
        return prev.filter((item) => item.menuItemId !== itemId);
      }

      const index = prev.findIndex((item) => item.menuItemId === itemId);
      if (index !== -1) {
        // Update existing
        const updated = [...prev];
        updated[index] = { ...updated[index], ...updatedItem };
        return updated;
      } else {
        // Add new
        return [...prev, updatedItem as MenuItem];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Restaurant Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    setUserRole(null);
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    onClick={() => setShowLoginForm(true)}
                  >
                    Login
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                    onClick={() => setShowRegisterForm(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {(userRole === "1" || userRole === "2") && (
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
                )}
                {(userRole === "1" || userRole === "3") && (
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
                )}

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
                <Tables
                  tables={tables}
                  orders={orders}
                  menuItems={menuItems}
                  updateTableStatus={updateTableStatus}
                  addTable={(table) => setTables((prev) => [...prev, table])}
                  deleteTable={(id) =>
                    setTables((prev) => prev.filter((t) => t.tableId !== id))
                  }
                />
              )}
              {activeTab === "menu" && (
                <Menu
                  menuItems={menuItems}
                  updateMenuItem={updateMenuItem}
                  categories={categories}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showRegisterForm && (
        <RegisterForm onClose={() => setShowRegisterForm(false)} />
      )}

      {/* LOGIN FORM */}
      {showLoginForm && (
        <LoginForm
          onClose={() => setShowLoginForm(false)}
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            const token = localStorage.getItem("token");
            if (token) {
              try {
                const decoded = jwtDecode<JwtPayload>(token);
                setUserRole(decoded.role);
                if (decoded.role === "3") {
                  setActiveTab("tables");
                } else {
                  setActiveTab("orders");
                }
              } catch (err) {
                console.error("Invalid token:", err);
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default App;

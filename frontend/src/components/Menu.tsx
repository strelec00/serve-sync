"use client";

import type React from "react";
import { useState, useMemo } from "react";
import type { MenuItem } from "../types";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";

interface MenuProps {
  menuItems: MenuItem[];
  updateMenuItem: (id: number, updatedItem: Partial<MenuItem>) => void;
}

const Menu: React.FC<MenuProps> = ({ menuItems, updateMenuItem }) => {
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({});

  // Group and sort menu items by category
  const groupedMenuItems = useMemo(() => {
    // Sort items by categoryId first
    const sortedItems = [...menuItems].sort(
      (a, b) => (a.categoryId || 0) - (b.categoryId || 0)
    );

    // Group items by category
    const grouped: Record<string, MenuItem[]> = {};

    sortedItems.forEach((item) => {
      const categoryName = item.categoryName || "Uncategorized";
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });

    return grouped;
  }, [menuItems]);

  const handleEdit = (item: MenuItem) => {
    setEditingItemId(item.menuItemId);
    setFormData(item);
  };

  const handleCancel = () => {
    setEditingItemId(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!editingItemId) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5123/menuitems/${editingItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Neuspješno ažuriranje");
      }

      updateMenuItem(editingItemId, formData);
      handleCancel();
    } catch (error) {
      console.error("Greška pri spremanju:", error);
    }
  };

  const handleChange = (field: keyof MenuItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
        <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
          + Add Item
        </button>
      </div>

      {Object.entries(groupedMenuItems).map(([categoryName, items]) => (
        <div key={categoryName} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">
            {categoryName}
          </h3>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
              >
                {editingItemId === item.menuItemId ? (
                  // Edit mode
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.name || ""}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={formData.description || ""}
                          onChange={(e) =>
                            handleChange("description", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price || ""}
                          onChange={(e) =>
                            handleChange(
                              "price",
                              Number.parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category ID
                        </label>
                        <input
                          type="number"
                          value={formData.categoryId || ""}
                          onChange={(e) =>
                            handleChange(
                              "categoryId",
                              Number.parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <XIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode - row layout
                  <div className="flex items-center p-3">
                    <div className="flex-grow grid grid-cols-12 gap-2">
                      <div className="flex items-center col-span-3">
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                      </div>
                      <div className="col-span-6 flex items-center text-sm text-gray-600 truncate">
                        {item.description}
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-semibold text-gray-900 ">
                          {item.price.toFixed(2)} €
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center p-1.5 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;

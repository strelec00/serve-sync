"use client";

import type React from "react";
import { useState } from "react";
import type { MenuItem } from "../types";
import { Edit, Save, X } from "lucide-react";

interface MenuProps {
  menuItems: MenuItem[];
  updateMenuItem: (itemId: number, updatedItem: Partial<MenuItem>) => void;
}

const Menu: React.FC<MenuProps> = ({ menuItems, updateMenuItem }) => {
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});

  const categories = ["Starter", "Main", "Side", "Dessert", "Drink"];

  const handleEditClick = (item: MenuItem) => {
    setEditingItemId(item.menuItemId);
    setEditForm({ ...item });
  };

  const handleSaveClick = () => {
    if (editingItemId && editForm) {
      updateMenuItem(editingItemId, editForm);
      setEditingItemId(null);
      setEditForm({});
    }
  };

  const handleCancelClick = () => {
    setEditingItemId(null);
    setEditForm({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === "price" ? Number.parseFloat(value) : value,
    });
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Menu</h2>

      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h3 className="text-md font-medium text-gray-700 mb-3">{category}</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.menuItemId}>
                  {editingItemId === item.menuItemId ? (
                    <div className="px-4 py-4 sm:px-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={editForm.name || ""}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Price
                          </label>
                          <input
                            type="number"
                            name="price"
                            id="price"
                            step="0.01"
                            value={editForm.price || ""}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={2}
                            value={editForm.description || ""}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Category
                          </label>
                          <select
                            name="category"
                            id="category"
                            value={editForm.category?.name || ""}
                            onChange={handleInputChange}
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleCancelClick}
                          className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveClick}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {item.name}
                          </p>
                          <p className="ml-2 text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditClick(item)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </button>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menu;

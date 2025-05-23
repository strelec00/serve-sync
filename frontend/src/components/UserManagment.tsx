"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Users, Check, AlertCircle, ChevronDown, Trash2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface Role {
  roleId: number;
  name: string;
}

interface User {
  userId: number;
  username: string;
  role: Role | null;
}

interface JwtPayload {
  id: string;
  sub?: string;
  nameid?: string;
}

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800 border-purple-200",
  Chef: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Waiter: "bg-blue-100 text-blue-800 border-blue-200",
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([
    { roleId: 1, name: "Admin" },
    { roleId: 2, name: "Chef" },
    { roleId: 3, name: "Waiter" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );

  useEffect(() => {
    // Get current user ID from token
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        // Try different possible ID fields in the token
        const userId = decoded.id || decoded.sub || decoded.nameid;
        if (userId) {
          setCurrentUserId(Number(userId));
        }
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch("http://localhost:5123/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    // Prevent changing own role
    if (userId === currentUserId) {
      setError("You cannot change your own role");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUpdatingUser(userId);
    setSuccessMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // The API expects the roleId as a URL parameter, not in the body
      const response = await fetch(
        `http://localhost:5123/users/${userId}/role?roleId=${newRoleId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          // No body needed, roleId is passed as a query parameter
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      const updatedUser = await response.json();

      // Update local state with the response from the server
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.userId === userId ? updatedUser : user))
      );

      const roleName =
        roles.find((r) => r.roleId === newRoleId)?.name || "Unknown";
      setSuccessMessage(`User role updated successfully to ${roleName}`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating user role:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    // Prevent deleting own account
    if (userId === currentUserId) {
      setError("You cannot delete your own account");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setDeletingUser(userId);
    setSuccessMessage(null);
    setError(null);
    setShowDeleteConfirm(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`http://localhost:5123/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Remove user from local state
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.userId !== userId)
      );

      setSuccessMessage(`User deleted successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setDeletingUser(null);
    }
  };

  const getRoleColor = (role: Role | null) => {
    if (!role) return "bg-gray-100 text-gray-800 border-gray-200";
    return roleColors[role.name] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Users className="mr-2 h-5 w-5" />
          User Management
        </h2>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Username
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Current Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Change Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const isCurrentUser = user.userId === currentUserId;
                return (
                  <tr
                    key={user.userId}
                    className={`hover:bg-gray-50 ${
                      isCurrentUser ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-600">
                          (You)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role ? user.role.name : "No Role"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative">
                        <select
                          value={user.role?.roleId || ""}
                          onChange={(e) =>
                            handleRoleChange(
                              user.userId,
                              Number(e.target.value)
                            )
                          }
                          disabled={
                            updatingUser === user.userId || isCurrentUser
                          }
                          className={`appearance-none block w-full px-3 py-2 border ${
                            isCurrentUser
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          } border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        >
                          <option value="" disabled>
                            Select Role
                          </option>
                          {roles.map((role) => (
                            <option key={role.roleId} value={role.roleId}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <ChevronDown className="h-4 w-4" />
                        </div>

                        {updatingUser === user.userId && (
                          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {showDeleteConfirm === user.userId ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteUser(user.userId)}
                            className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="text-gray-600 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(user.userId)}
                          disabled={
                            isCurrentUser || deletingUser === user.userId
                          }
                          className={`inline-flex items-center text-red-600 hover:text-red-800 ${
                            isCurrentUser ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          title={
                            isCurrentUser
                              ? "You cannot delete your own account"
                              : "Delete user"
                          }
                        >
                          {deletingUser === user.userId ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

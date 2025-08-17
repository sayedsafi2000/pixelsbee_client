"use client";
import { useEffect, useState } from "react";
import { FaUser, FaUserShield, FaUserTimes, FaUserCheck, FaLockOpen, FaLock } from "react-icons/fa";

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/users/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to approve user");
      }
      
      const result = await res.json();
      setSuccess(result.message || "User approved successfully!");
      await fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message || "Failed to approve user");
      console.error("Error approving user:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleBlock(id) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/users/${id}/block`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to block user");
      }
      
      const result = await res.json();
      setSuccess(result.message || "User blocked successfully!");
      await fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message || "Failed to block user");
      console.error("Error blocking user:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleUnblock(id) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/users/${id}/unblock`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to unblock user");
      }
      
      const result = await res.json();
      setSuccess(result.message || "User unblocked successfully!");
      await fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message || "Failed to unblock user");
      console.error("Error unblocking user:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FaUserTimes className="w-3 h-3" /> },
      approved: { color: 'bg-green-100 text-green-800', icon: <FaUserCheck className="w-3 h-3" /> },
      blocked: { color: 'bg-red-100 text-red-800', icon: <FaLock className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getActions = (user) => {
    const userId = user._id || user.id; // Handle both MongoDB _id and regular id
    
    if (user.role === 'admin') {
      return <span className="text-neutral-400 italic">N/A</span>;
    }
    
    if (user.status === 'pending') {
      return (
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition disabled:opacity-50"
            disabled={actionLoading[userId]}
            onClick={() => handleApprove(userId)}
          >
            {actionLoading[userId] ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
            ) : (
              <FaUserCheck />
            )}
            Approve
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition disabled:opacity-50"
            disabled={actionLoading[userId]}
            onClick={() => handleBlock(userId)}
          >
            {actionLoading[userId] ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
            ) : (
              <FaLock />
            )}
            Block
          </button>
        </div>
      );
    } else if (user.status === 'blocked') {
      return (
        <button
          className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 transition disabled:opacity-50"
          disabled={actionLoading[userId]}
          onClick={() => handleUnblock(userId)}
        >
          {actionLoading[userId] ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
          ) : (
            <FaLockOpen />
          )}
          Unblock
        </button>
      );
    } else {
      return (
        <button
          className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition disabled:opacity-50"
          disabled={actionLoading[userId]}
          onClick={() => handleBlock(userId)}
        >
          {actionLoading[userId] ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
          ) : (
            <FaLock />
          )}
          Block
        </button>
      );
    }
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      blocked: 0,
      total: users.length
    };
    
    users.forEach(user => {
      counts[user.status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen p-6 bg-neutral-100 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <FaUserShield className="text-blue-600" />
          Manage Users
        </h1>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Users</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{statusCounts.total}</p>
              </div>
              <FaUser className="text-3xl text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <FaUserTimes className="text-3xl text-yellow-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <FaUserCheck className="text-3xl text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Blocked</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.blocked}</p>
              </div>
              <FaLock className="text-3xl text-red-500" />
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => setError("")} 
              className="float-right text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400 ml-4">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {users.map((user) => {
                  const userId = user._id || user.id; // Handle both MongoDB _id and regular id
                  return (
                    <tr key={userId} className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                        {user.profile_pic_url ? (
                          <img src={user.profile_pic_url} alt="avatar" className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <span className="font-semibold text-neutral-800 dark:text-neutral-100">{user.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-700 dark:text-neutral-200">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' : user.role === 'vendor' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getActions(user)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
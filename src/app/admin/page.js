"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUsers, FaUserTie, FaBoxOpen, FaChartBar, FaUserCheck, FaUserTimes, FaClock, FaUserShield } from "react-icons/fa";
import { adminAPI } from "../../utils/api";

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/');
      return;
    }
    async function fetchData() {
      try {
        setLoading(true);
        const data = await adminAPI.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Users</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalUsers || 0}</p>
            </div>
            <FaUsers className="text-3xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Vendors</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalVendors || 0}</p>
            </div>
            <FaUserTie className="text-3xl text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Products</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalProducts || 0}</p>
            </div>
            <FaBoxOpen className="text-3xl text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">${(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <FaChartBar className="text-3xl text-purple-500" />
          </div>
        </div>
      </div>
      {/* User Status Breakdown - removed for now to prevent errors */}
      {/*
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaUserCheck className="text-2xl text-green-500" />
            <h3 className="text-lg font-semibold">Approved Users</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.users.approved_users}</p>
          <p className="text-sm text-neutral-500 mt-2">Active users on the platform</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaUserTimes className="text-2xl text-red-500" />
            <h3 className="text-lg font-semibold">Blocked Users</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.users.blocked_users}</p>
          <p className="text-sm text-neutral-500 mt-2">Users with restricted access</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaUserShield className="text-2xl text-blue-500" />
            <h3 className="text-lg font-semibold">Regular Users</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.users.total_regular_users}</p>
          <p className="text-sm text-neutral-500 mt-2">Standard user accounts</p>
        </div>
      </div>
      */}
      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/vendors" className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
            <FaUserTie className="text-2xl text-green-500 mb-2" />
            <h3 className="font-semibold">Manage Vendors</h3>
            <p className="text-sm text-neutral-500">Approve or block vendors</p>
          </Link>
          <Link href="/admin/users" className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
            <FaUsers className="text-2xl text-blue-500 mb-2" />
            <h3 className="font-semibold">Manage Users</h3>
            <p className="text-sm text-neutral-500">Block or unblock users</p>
          </Link>
          <Link href="/admin/products" className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
            <FaBoxOpen className="text-2xl text-red-500 mb-2" />
            <h3 className="font-semibold">View Products</h3>
            <p className="text-sm text-neutral-500">Browse all products</p>
          </Link>
          <Link href="/admin/profile" className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
            <FaUserShield className="text-2xl text-purple-500 mb-2" />
            <h3 className="font-semibold">Admin Profile</h3>
            <p className="text-sm text-neutral-500">Update your settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 
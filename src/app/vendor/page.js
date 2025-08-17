"use client";
import { FaBoxOpen, FaUser, FaShoppingCart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vendorAPI, productAPI } from "../../utils/api";
import Link from "next/link";

export default function VendorDashboardHome() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ordersData, profileData] = await Promise.all([
          productAPI.getVendorProducts(),
          vendorAPI.getOrders(),
          vendorAPI.getProfile()
        ]);
        setProducts(productsData);
        setOrders(ordersData);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const paidOrders = orders.filter(order => order.status === 'paid');
  const approvedOrders = orders.filter(order => order.status === 'approved');
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile.name || 'Vendor'}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 flex flex-col items-center">
          <FaBoxOpen className="text-3xl text-red-500 mb-2" />
          <div className="text-2xl font-bold">{products.length}</div>
          <div className="text-sm text-neutral-500">My Products</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 flex flex-col items-center">
          <FaShoppingCart className="text-3xl text-green-500 mb-2" />
          <div className="text-2xl font-bold">{orders.length}</div>
          <div className="text-sm text-neutral-500">Total Orders</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
          <div className="text-sm text-neutral-500">Pending Orders</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 flex flex-col items-center">
          <FaUser className="text-3xl text-blue-500 mb-2" />
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-neutral-500">Total Revenue</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/vendor/orders" className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <FaShoppingCart className="mr-2 text-green-500" />
            View Orders
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300">
            See all customer orders and manage your sales
          </p>
        </Link>
        
        <Link href="/vendor/create" className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <FaBoxOpen className="mr-2 text-red-500" />
            Add Product
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300">
            Create new products to sell in your shop
          </p>
        </Link>
      </div>

      {/* Order Status Summary */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Status Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Pending</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{approvedOrders.length}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Approved</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'shipped').length}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Shipped</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{orders.filter(o => o.status === 'delivered').length}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">Delivered</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Dashboard Overview</h2>
        <p className="text-neutral-700 dark:text-neutral-300">
          Use the sidebar to manage your products, update your profile, or add new products to your shop.
        </p>
      </div>
    </div>
  );
} 
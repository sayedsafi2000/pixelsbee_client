"use client";
import { FaHeart, FaDownload, FaUser, FaShoppingBag } from "react-icons/fa";
import { useEffect, useState } from "react";
import { userAPI } from "../../utils/api";
import { useRouter } from "next/navigation";

export default function UserDashboardHome() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();
  
  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to view your dashboard');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setError('Please log in to view your dashboard');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Please log in to view your dashboard');
      }
    }
    
    async function fetchUserStats() {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const [favoritesData, downloadsData, purchasedData] = await Promise.all([
          userAPI.getFavorites(),
          userAPI.getDownloads(),
          userAPI.getPurchasedProducts()
        ]);
        
        // Ensure all are arrays
        setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
        setDownloads(Array.isArray(downloadsData) ? downloadsData : []);
        setPurchasedProducts(Array.isArray(purchasedData) ? purchasedData : []);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setFavorites([]);
        setDownloads([]);
        setPurchasedProducts([]);
      }
    }
    
    fetchUserData();
    fetchUserStats();
  }, [router]);

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || 'User'}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 flex flex-col items-center">
          <FaHeart className="text-3xl text-red-500 mb-2" />
          <div className="text-2xl font-bold">{favorites.length}</div>
          <div className="text-sm text-neutral-500">My Favorites</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 flex flex-col items-center">
          <FaDownload className="text-3xl text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{downloads.length}</div>
          <div className="text-sm text-neutral-500">Downloads</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 flex flex-col items-center">
          <FaShoppingBag className="text-3xl text-green-500 mb-2" />
          <div className="text-2xl font-bold">{purchasedProducts.length}</div>
          <div className="text-sm text-neutral-500">Purchased</div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6 flex flex-col items-center">
          <FaUser className="text-3xl text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{user?.name || '-'}</div>
          <div className="text-sm text-neutral-500">Profile Name</div>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Dashboard Overview</h2>
        <p className="text-neutral-700 dark:text-neutral-300">Use the sidebar to manage your favorites, view your purchases, downloads, or update your profile.</p>
      </div>
    </div>
  );
} 
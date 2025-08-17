"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTachometerAlt, FaHeart, FaUser, FaDownload, FaSignOutAlt, FaShoppingBag } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function UserLayout({ children }) {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/');
      return;
    }
    async function fetchUser() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    fetchUser();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  
  const sidebarLinks = [
    { label: 'Dashboard', href: '/user', icon: <FaTachometerAlt /> },
    { label: 'My Favorites', href: '/user/favorites', icon: <FaHeart /> },
    { label: 'My Purchases', href: '/user/purchased', icon: <FaShoppingBag /> },
    { label: 'Downloads', href: '/user/downloads', icon: <FaDownload /> },
    { label: 'Profile', href: '/user/profile', icon: <FaUser /> },
  ];
  
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8 bg-neutral-50 dark:bg-neutral-950 min-h-screen">{children}</main>
      {/* User Info Panel on the right */}
      <div className="w-64 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex flex-col items-center mb-8">
          {user?.profile_pic_url ? (
            <img src={user.profile_pic_url} alt="Profile" className="w-20 h-20 rounded-full border border-neutral-300 dark:border-neutral-700 mb-3" />
          ) : (
            <div className="w-20 h-20 rounded-full border border-neutral-300 dark:border-neutral-700 mb-3 bg-red-600 text-white flex items-center justify-center text-xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="text-center">
            <div className="font-bold text-lg text-neutral-800 dark:text-neutral-100">{user?.name || 'User'}</div>
            <div className="text-sm text-neutral-500 capitalize">{user?.role || 'user'}</div>
            <div className="text-xs text-neutral-400 mt-1">{user?.email}</div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 mb-8">
          {sidebarLinks.map(link => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors ${pathname === link.href ? 'bg-red-50 dark:bg-neutral-800 text-red-600' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
              {link.icon}{link.label}
            </Link>
          ))}
        </nav>
        
        {/* Logout Button */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-neutral-800 transition w-full" onClick={handleLogout}>
          <FaSignOutAlt />Logout
        </button>
      </div>
    </div>
  );
} 
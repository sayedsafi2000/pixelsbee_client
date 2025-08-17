"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "./CartContext";

const navItems = [
  { name: "Home", href: "/", icon: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"></path></svg>
  ) },
  { name: "Explore", href: "/explore", icon: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
  ) },
  { name: "Create", href: "/create", icon: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
  ) },
];

function getUserRole() {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
      }
    }
  } catch (error) {
    console.error('Error parsing token:', error);
  }
  return null;
}

export default function Sidebar({ onLogin, onRegister, user: propUser }) {
  const pathname = usePathname();
  const [user, setUser] = useState(propUser);
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Update user state when prop changes
  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    }
  }, [propUser]);
  
  // Get user role only after mounting
  useEffect(() => { 
    if (mounted) {
      setRole(getUserRole()); 
    }
  }, [mounted]);
  
  const isLoggedIn = !!user;
  
  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-20 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow z-40 py-6 items-center gap-6">
      <div className="mb-8 flex flex-col items-center">
        <span className="text-red-600 font-bold text-3xl tracking-tight">P</span>
      </div>
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl transition-all w-16 text-xs font-semibold
            ${pathname === item.href ? "bg-neutral-200 dark:bg-neutral-800 text-red-600" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          {item.icon}
          <span>{item.name}</span>
        </Link>
      ))}
      <Link href="/cart" className="relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl transition-all w-16 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <FaShoppingCart className="text-2xl" />
        <span>Cart</span>
        {mounted && cartCount > 0 && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{cartCount}</span>
        )}
      </Link>
      {mounted && role === 'admin' && (
        <Link href="/admin" className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl transition-all w-16 text-xs font-semibold ${pathname.startsWith('/admin') ? 'bg-neutral-200 dark:bg-neutral-800 text-red-600' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"></path></svg>
          <span>Admin</span>
        </Link>
      )}
      {mounted && role === 'vendor' && (
        <Link href="/vendor" className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl transition-all w-16 text-xs font-semibold ${pathname.startsWith('/vendor') ? 'bg-neutral-200 dark:bg-neutral-800 text-red-600' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <span>Vendor</span>
        </Link>
      )}
      <div className="flex-1" />
      {!isLoggedIn ? (
        <>
          <button className="mb-2 px-2 py-2 w-16 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition text-xs" onClick={onLogin}>Log in</button>
          <button className="mb-4 px-2 py-2 w-16 rounded-full border border-red-600 text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-neutral-800 transition text-xs" onClick={onRegister}>Sign up</button>
        </>
      ) : (
        <div className="flex flex-col items-center mb-4">
          {user.profile_pic_url ? (
            <img src={user.profile_pic_url} alt="Profile" className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 mb-2" />
          ) : (
            <div className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 mb-2 bg-red-600 text-white flex items-center justify-center text-sm font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <span className="text-xs text-neutral-600 dark:text-neutral-400 text-center">{user.name}.</span>
        </div>
      )}
    </aside>
  );
} 
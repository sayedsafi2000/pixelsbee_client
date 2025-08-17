"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser, FaBoxOpen, FaTachometerAlt, FaSignOutAlt } from "react-icons/fa";

export default function DashboardSidebar({ user, onLogout, links }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-lg p-6 gap-6 sticky top-0">
      <div className="flex flex-col items-center mb-8">
        {user?.profile_pic_url ? (
          <img src={user.profile_pic_url} alt="avatar" className="w-16 h-16 rounded-full border border-neutral-300 dark:border-neutral-700 mb-2" />
        ) : (
          <div className="w-16 h-16 rounded-full border border-neutral-300 dark:border-neutral-700 mb-2 bg-red-600 text-white flex items-center justify-center text-lg font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        <div className="font-bold text-lg text-neutral-800 dark:text-neutral-100">{user?.name || 'User'}</div>
        <div className="text-xs text-neutral-500 capitalize">{user?.role}</div>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map(link => (
          <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors ${pathname === link.href ? 'bg-red-50 dark:bg-neutral-800 text-red-600' : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>{link.icon}{link.label}</Link>
        ))}
      </nav>
      <div className="flex-1" />
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-neutral-800 transition" onClick={onLogout}><FaSignOutAlt />Logout</button>
    </aside>
  );
} 
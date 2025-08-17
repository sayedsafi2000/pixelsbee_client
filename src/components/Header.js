"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaChevronDown, FaSearch, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartContext";

export default function Header({ onLogin, onRegister, user: propUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [homeHover, setHomeHover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const handleLogout = () => {
    logout();
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/products/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      handleSearch(query);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 sm:px-8 h-16">
      {/* Logo */}
      <div className="flex items-center mr-4 flex-shrink-0">
        <Link href="/" className="flex items-center group cursor-pointer">
          <span className="text-red-600 font-bold text-2xl tracking-tight">P</span>
          <span className="hidden sm:inline text-xl font-semibold ml-1 text-neutral-800 dark:text-neutral-100 group-hover:underline">Pixelsbee</span>
        </Link>
      </div>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden ml-auto p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open menu"
      >
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Desktop Nav/Search */}
      <nav className="hidden md:flex items-center gap-2 sm:gap-4">
        <div className="relative" onMouseEnter={() => setHomeHover(true)} onMouseLeave={() => setHomeHover(false)}>
          <Link href="/" className={`font-semibold px-3 py-2 rounded-full transition-colors ${pathname === "/" ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" : "text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>Home</Link>
          {homeHover && (
            <button
              className="absolute right-0 top-full mt-2 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg font-semibold hover:bg-red-700 transition z-50"
              style={{ minWidth: 120 }}
              onClick={async () => {
                if (!user) {
                  if (onLogin) onLogin();
                  else window.location.href = '/login';
                  return;
                }
                // Simulate download (replace with real file if needed)
                const blob = new Blob(["Download started!"], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'file.txt';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              }}
            >
              Download
            </button>
          )}
        </div>
        <Link href="/explore" className={`font-semibold px-3 py-2 rounded-full transition-colors ${pathname.startsWith("/explore") ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>Explore</Link>
        <Link href="/create" className={`font-semibold px-3 py-2 rounded-full transition-colors ${pathname.startsWith("/create") ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>Create</Link>
      </nav>
      {/* Search bar and cart button container */}
      <div className="hidden md:flex flex-1 mx-4 items-center gap-3">
        {/* Search bar */}
        <div className="flex-1 relative search-container">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
              className="w-full px-4 py-2 pr-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-neutral-500 hover:text-red-600 transition-colors"
            >
              <FaSearch size={16} />
            </button>
          </form>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 cursor-pointer"
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery('');
                    // Navigate to product detail page
                    router.push(`/${product.id}`);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-100">{product.title}</div>
                      <div className="text-sm text-neutral-500">{product.description}</div>
                    </div>
                    <div className="text-sm font-semibold text-red-600">${product.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Cart Icon - positioned to the right of search bar */}
        <Link href="/cart" className="relative flex items-center group">
          <FaShoppingCart className="text-2xl text-neutral-700 dark:text-neutral-100 group-hover:text-red-600 transition" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{cartCount}</span>
          )}
        </Link>
      </div>
      {/* Only show avatar/dropdown or login/signup in the rightmost section */}
      <div className="hidden md:flex items-center gap-2">
        {user ? (
          <div className="relative ml-4">
            <button onClick={() => setDropdown(v => !v)} className="flex items-center gap-2 focus:outline-none group">
              {user.profile_pic_url ? (
                <img src={user.profile_pic_url} alt="avatar" className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700" />
              ) : (
                <div className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <FaChevronDown className={`transition-transform duration-200 ${dropdown ? 'rotate-180' : ''} text-neutral-500 group-hover:text-red-600`} />
            </button>
            <div className={`absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl z-50 transition-all duration-200 ${dropdown ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`} style={{minWidth:'220px'}}>
              <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                {user.profile_pic_url ? (
                  <img src={user.profile_pic_url} alt="avatar" className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700" />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-neutral-800 dark:text-neutral-100">{user.name || 'User'}</div>
                  <div className="text-xs text-neutral-500 capitalize">{user.role}</div>
                </div>
              </div>
              <div className="py-2">
                {user.role === 'admin' && <Link href="/admin" className="block px-4 py-2 hover:bg-red-50 dark:hover:bg-neutral-800 transition rounded" onClick={() => setDropdown(false)}>Admin Dashboard</Link>}
                {user.role === 'vendor' && <Link href="/vendor" className="block px-4 py-2 hover:bg-red-50 dark:hover:bg-neutral-800 transition rounded" onClick={() => setDropdown(false)}>Vendor Dashboard</Link>}
                {user.role === 'user' && <Link href="/user" className="block px-4 py-2 hover:bg-red-50 dark:hover:bg-neutral-800 transition rounded" onClick={() => setDropdown(false)}>User Dashboard</Link>}
              </div>
              <div className="border-t border-neutral-100 dark:border-neutral-800">
                <button className="block w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-neutral-800 text-red-600 font-semibold transition rounded-b-xl" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <button className="px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition" onClick={onLogin}>Log in</button>
            <button className="px-4 py-2 rounded-full border border-red-600 text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-neutral-800 transition" onClick={onRegister}>Sign up</button>
          </>
        )}
      </div>
      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/30" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-0 left-0 w-64 h-full bg-white dark:bg-neutral-900 shadow-lg flex flex-col p-6 gap-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center mb-4">
              <span className="text-red-600 font-bold text-2xl tracking-tight">P</span>
              <span className="ml-2 text-xl font-semibold text-neutral-800 dark:text-neutral-100">Pinterest</span>
            </div>
            <nav className="flex flex-col gap-2">
              <Link href="/" className={`font-semibold px-3 py-2 rounded-full transition-colors ${pathname === "/" ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" : "text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`} onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/explore" className={`font-semibold px-3 py-2 rounded-full transition-colors ${pathname.startsWith("/explore") ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`} onClick={() => setMenuOpen(false)}>Explore</Link>
              <Link href="/create" className={`font-semibold px-3 py-2 rounded-full transition-colors ${pathname.startsWith("/create") ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`} onClick={() => setMenuOpen(false)}>Create</Link>
              {user ? (
                <div className="relative ml-4 mt-2">
                  <button onClick={() => setDropdown(v => !v)} className="flex items-center focus:outline-none">
                    {user.profile_pic_url && (
                      <img src={user.profile_pic_url} alt="avatar" className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700" />
                    )}
                  </button>
                  {dropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded shadow-lg z-50">
                      {user.role === 'admin' && <Link href="/admin" className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setDropdown(false); setMenuOpen(false); }}>Admin Dashboard</Link>}
                      {user.role === 'vendor' && <Link href="/vendor" className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setDropdown(false); setMenuOpen(false); }}>Vendor Dashboard</Link>}
                      <button className="block w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-600" onClick={() => { setDropdown(false); setMenuOpen(false); handleLogout(); }}>Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className="mt-4 px-4 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition" onClick={() => { setMenuOpen(false); onLogin(); }}>Log in</button>
                  <button className="mt-2 px-4 py-2 rounded-full border border-red-600 text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-neutral-800 transition" onClick={() => { setMenuOpen(false); onRegister(); }}>Sign up</button>
                </>
              )}
            </nav>
            <form onSubmit={handleSearchSubmit} className="w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
} 
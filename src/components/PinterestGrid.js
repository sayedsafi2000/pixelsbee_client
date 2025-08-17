"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaHeart, FaDownload, FaShoppingCart, FaSync } from "react-icons/fa";
import { userAPI, productAPI } from "../utils/api";
import { useCart } from "./CartContext";

export default function PinterestGrid({ images: imagesProp, category = "All", onLogin }) {
  const [images, setImages] = useState(imagesProp || []);
  const [user, setUser] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [favoriteStates, setFavoriteStates] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading products from database...'); // Debug log
      const products = await productAPI.getAllProducts();
      console.log('Products loaded:', products); // Debug log
      
      if (products && products.length > 0) {
        console.log('Products with status:', products.map(p => ({ id: p._id, title: p.title, status: p.status }))); // Debug log
        
        // Transform products to match expected format
        const transformedProducts = products.map(product => ({
          id: product._id,
          name: product.title,
          author: product.vendor_id?.name || 'Unknown Vendor',
          authorImg: product.vendor_id?.profile_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNEN0E3QjgiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTQgcy0xLjc5LTQtNC00LTQgNC0xLjc5IDQtNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+Cjwvc3ZnPgo8L3N2Zz4K',
          imgWatermark: product.image_url,
          originalUrl: product.original_url,
          price: product.price,
          category: product.category,
          react: 0, // Default value since server doesn't provide this
          status: product.status
        }));
        
        setImages(transformedProducts);
      } else {
        console.log('No products found in database');
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error.message || 'Failed to load products');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function loadProductsOnMount() {
      if (isMounted) {
        await loadProducts();
      }
    }
    
    loadProductsOnMount();
    
    // Fetch user for auth check - only after component is mounted
    async function fetchUser() {
      // Only access localStorage after component is mounted (client-side)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const userData = await userAPI.getProfile();
            if (isMounted) {
              setUser(userData);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            if (isMounted) {
              setUser(null);
            }
          }
        } else {
          // No token means user is not logged in
          if (isMounted) {
            setUser(null);
          }
        }
      }
    }
    
    // Delay user fetch to avoid hydration issues
    const timer = setTimeout(() => {
      fetchUser();
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imagesProp, loadProducts]);

  // Check favorite status for all images
  useEffect(() => {
    async function checkFavorites() {
      if (!user) return;
      
      const newFavoriteStates = {};
      for (let i = 0; i < images.length; i++) {
        try {
          const result = await userAPI.checkFavorite(images[i].id);
          newFavoriteStates[i] = result.isFavorite || false;
        } catch (error) {
          console.error('Error checking favorite for image', i, error);
          newFavoriteStates[i] = false;
        }
      }
      setFavoriteStates(newFavoriteStates);
    }
    
    if (user && images.length > 0) {
      checkFavorites();
    }
  }, [user, images]);

  const handleFavorite = async (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      if (onLogin) onLogin();
      return;
    }

    setLoadingStates(prev => ({ ...prev, [idx]: true }));
    
    try {
      const img = images[idx];
      if (favoriteStates[idx]) {
        await userAPI.removeFromFavorites(img.id);
        setFavoriteStates(prev => ({ ...prev, [idx]: false }));
      } else {
        await userAPI.addToFavorites(img.id, img);
        setFavoriteStates(prev => ({ ...prev, [idx]: true }));
      }
    } catch (error) {
      console.error('Error handling favorite:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [idx]: false }));
    }
  };

  const { add: addToCart } = useCart();
  const [notification, setNotification] = useState("");

  // Add to cart handler with notification
  const handleAddToCart = (img, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(img, 1);
    setNotification("Added to cart!");
    setTimeout(() => setNotification(""), 1500);
  };

  // Replace handleDownload to only allow free products
  const handleDownload = async (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    const img = images[idx];
    if (img.price > 0) return; // Block download for paid
    if (!user) {
      if (onLogin) onLogin();
      return;
    }
    setLoadingStates(prev => ({ ...prev, [idx]: true }));
    try {
      // Add to downloads first
      await userAPI.addToDownloads(img.id, img);
      
      // Use the product API download function
      const downloadData = await productAPI.downloadProduct(img.id);
      
      // Fetch the actual image from the download URL
      const imageResponse = await fetch(downloadData.downloadUrl);
      const blob = await imageResponse.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadData.filename || (img.name ? img.name.replace(/\s+/g, '_') + '.jpg' : 'image.jpg');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: try direct download from original URL if available
      try {
        if (img.originalUrl) {
          const response = await fetch(img.originalUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = img.name ? img.name.replace(/\s+/g, '_') + '.jpg' : 'image.jpg';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [idx]: false }));
    }
  };

  // Filter images by category if not 'All'
  const filteredImages = category === "All"
    ? images
    : images.filter((img) => img.category === category);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading products from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Database Connection Error</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {error}
            </p>
            <div className="space-y-2 text-sm text-neutral-500">
              <p>To fix this:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ensure MySQL is running</li>
                <li>Check database connection settings</li>
                <li>Verify the server is properly configured</li>
              </ul>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 max-w-7xl mx-auto [column-fill:_balance]">
      <style>{`.masonry-card{margin-bottom:1rem;}`}</style>
      

      
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in">
          {notification}
        </div>
      )}
      {!loading && !error && filteredImages.map((img, idx) => (
        <div
          key={idx}
          className="masonry-card break-inside-avoid rounded-lg overflow-hidden shadow hover:shadow-lg bg-white dark:bg-neutral-800 transition-shadow duration-200 relative group"
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* For free: click image downloads. For paid: click image goes to detail page. */}
          {img.price > 0 ? (
            <Link href={`/${String(img.id || img._id || '')}`} scroll={false}>
              <img
                src={img.imgWatermark}
                alt={img.name}
                className="w-full h-auto block hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                loading="lazy"
                style={{display:'block',width:'100%'}}
              />
            </Link>
          ) : (
            <a href="#" onClick={e => handleDownload(idx, e)}>
              <img
                src={img.imgWatermark}
                alt={img.name}
                className="w-full h-auto block hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                loading="lazy"
                style={{display:'block',width:'100%'}}
              />
            </a>
          )}
          {/* Action buttons on hover */}
          {hoveredIdx === idx && (
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <button
                onClick={(e) => handleFavorite(idx, e)}
                disabled={loadingStates[idx]}
                className={`p-2 rounded-full shadow-lg transition ${
                  favoriteStates[idx]
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 dark:bg-neutral-800/90 text-red-500 hover:bg-red-100 dark:hover:bg-red-900'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <FaHeart className="text-sm" />
              </button>
              {img.price > 0 ? (
                <button
                  onClick={e => handleAddToCart(img, e)}
                  className="p-2 rounded-full shadow-lg bg-green-600 text-white hover:bg-green-700 transition"
                  style={{ cursor: 'pointer' }}
                  title="Add to Cart"
                >
                  <FaShoppingCart className="text-lg" />
                </button>
              ) : (
                <button
                  onClick={e => handleDownload(idx, e)}
                  disabled={loadingStates[idx]}
                  className="p-2 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  style={{ cursor: 'pointer' }}
                >
                  <FaDownload className="text-sm" />
                </button>
              )}
            </div>
          )}
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img
                src={img.authorImg}
                alt={img.author}
                className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700"
              />
              <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-200">{img.author}</span>
            </div>
            <div className="text-base font-medium text-neutral-900 dark:text-neutral-100">{img.name}</div>
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>❤️ {img.react}</span>
              <span className="bg-red-600 text-white rounded px-2 py-0.5 font-semibold">${img.price}</span>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 
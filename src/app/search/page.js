"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { productAPI } from "../../utils/api";
import PinterestGrid from "../../components/PinterestGrid";
import { FaSearch, FaSpinner } from "react-icons/fa";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setError("");
    try {
      const results = await productAPI.searchProducts(searchQuery);
      setProducts(results);
    } catch (error) {
      console.error('Search failed:', error);
      setError("Failed to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Search Products</h1>
            <p className="text-gray-600 dark:text-gray-400">Enter a search term to find products</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <FaSearch className="text-2xl text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Search Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Showing results for "{query}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaSpinner className="text-4xl text-red-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Searching for products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No products found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No products match your search for "{query}"
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Found {products.length} product{products.length !== 1 ? 's' : ''} for "{query}"
              </p>
            </div>
            <PinterestGrid
              images={products.map(product => ({
                id: product.id,
                name: product.title,
                imgWatermark: product.image_url,
                img: product.image_url,
                author: product.vendor_name || "Unknown Vendor",
                authorImg: "https://randomuser.me/api/portraits/men/32.jpg",
                react: Math.floor(Math.random() * 200) + 50,
                category: product.category || "General",
                price: product.price,
                description: product.description
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
} 
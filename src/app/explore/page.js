"use client";
import { useState, useEffect } from "react";
import PinterestGrid from "../../components/PinterestGrid";
import { productAPI } from "../../utils/api";
import { useAuth } from "../../components/AuthProvider";

export default function ExplorePage() {
  const { login } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const dbCategories = await productAPI.getCategories();
        
        // Add "All" category at the beginning
        const allCategories = ["All", ...dbCategories];
        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Failed to load categories');
        // Fallback to default categories
        setCategories(["All", "Photography", "Digital Art", "Illustration", "Vector Graphics", "3D Art", "Typography", "UI/UX Design", "Web Templates", "Print Design", "Other"]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Error Loading Categories</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-neutral-800 dark:text-neutral-100">Explore</h1>
      
      {/* Category Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center max-w-4xl">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full shadow transition font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
              selectedCategory === cat 
                ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="w-full max-w-7xl">
        <PinterestGrid category={selectedCategory} onLogin={login} />
      </div>
    </div>
  );
} 
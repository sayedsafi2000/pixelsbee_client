"use client";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { userAPI } from "../../../utils/api";
import { useRouter } from "next/navigation";

export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchFavorites() {
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to view your favorites');
        setLoading(false);
        return;
      }

      try {
        const data = await userAPI.getFavorites();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          console.error('Invalid favorites data:', data);
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        if (error.message === 'No token provided' || error.message === 'Unauthorized') {
          setError('Please log in to view your favorites');
        } else {
          setError('Failed to load favorites');
        }
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [router]);

  const handleRemoveFavorite = async (imageId) => {
    try {
      await userAPI.removeFromFavorites(imageId);
      setFavorites(favorites.filter(fav => fav.image_id !== imageId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaHeart /> My Favorites</h1>
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
        {loading ? (
          <div>Loading favorites...</div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-8">
            <FaHeart className="text-4xl text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No favorites yet. Start exploring and add some images to your favorites!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((item) => {
              const imageData = item.image_data;
              if (!imageData) return null; // Skip items with null image_data
              
              return (
                <div key={item.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 relative">
                  <img 
                    src={imageData.imgWatermark || imageData.image_url} 
                    alt={imageData.name || 'Image'} 
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{imageData.name || 'Untitled'}</h3>
                  <p className="text-sm text-neutral-500">by {imageData.author || 'Unknown'}</p>
                  <button 
                    onClick={() => handleRemoveFavorite(item.image_id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <FaHeart className="text-sm" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
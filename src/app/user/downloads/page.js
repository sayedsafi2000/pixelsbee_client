"use client";
import { useEffect, useState } from "react";
import { FaDownload, FaExternalLinkAlt } from "react-icons/fa";
import { userAPI } from "../../../utils/api";
import { useRouter } from "next/navigation";

export default function UserDownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDownloads() {
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to view your downloads');
        setLoading(false);
        return;
      }

      try {
        const data = await userAPI.getDownloads();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setDownloads(data);
        } else {
          console.error('Invalid downloads data:', data);
          setDownloads([]);
        }
      } catch (error) {
        console.error('Error fetching downloads:', error);
        if (error.message === 'No token provided' || error.message === 'Unauthorized') {
          setError('Please log in to view your downloads');
        } else {
          setError('Failed to load downloads');
        }
        setDownloads([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDownloads();
  }, []);

  const handleDownload = (imageData) => {
    if (imageData.original_url) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = imageData.original_url;
      link.download = imageData.title || 'image';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Download link not available');
    }
  };

  const getProductInfo = (imageData) => {
    return {
      title: imageData.title || imageData.name || 'Untitled',
      description: imageData.description || 'No description available',
      image_url: imageData.image_url || imageData.imgWatermark,
      original_url: imageData.original_url,
      category: imageData.category || 'General',
      price: imageData.price || 'Free',
      order_id: imageData.order_id,
      purchased_at: imageData.purchased_at
    };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaDownload /> My Downloads</h1>
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
        {loading ? (
          <div>Loading downloads...</div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-8">
            <FaDownload className="text-4xl text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No downloads yet. Start exploring and download some images!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((item) => {
              const imageData = item.image_data;
              if (!imageData) return null; // Skip items with null image_data
              
              const productInfo = getProductInfo(imageData);
              
              return (
                <div key={item._id || item.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden">
                  <div className="relative">
                    <img 
                      src={productInfo.image_url} 
                      alt={productInfo.title} 
                      className="w-full h-48 object-cover"
                    />
                    {productInfo.order_id && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                          Purchased
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg mb-2">
                      {productInfo.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                      {productInfo.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Category:</span>
                        <span className="text-neutral-700 dark:text-neutral-300">{productInfo.category}</span>
                      </div>
                      {productInfo.price && productInfo.price !== 'Free' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Price:</span>
                          <span className="text-green-600 font-semibold">${productInfo.price}</span>
                        </div>
                      )}
                      {productInfo.purchased_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Purchased:</span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {new Date(productInfo.purchased_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Added:</span>
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {new Date(item.downloaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(productInfo)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <FaDownload />
                        Download
                      </button>
                      {productInfo.original_url && (
                        <a
                          href={productInfo.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center justify-center"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
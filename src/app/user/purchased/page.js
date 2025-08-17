"use client";
import { useEffect, useState } from "react";
import { userAPI } from "../../../utils/api";
import { FaDownload, FaCheckCircle, FaTruck, FaBox } from "react-icons/fa";

export default function UserPurchasedProducts() {
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      try {
        setLoading(true);
        const products = await userAPI.getPurchasedProducts();
        setPurchasedProducts(products);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching purchased products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedProducts();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'delivered':
        return <FaBox className="text-purple-500" />;
      case 'shipped':
        return <FaTruck className="text-blue-500" />;
      case 'paid':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaCheckCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'delivered':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'shipped':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'paid':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const handleDownload = async (productId, productData) => {
    try {
      await userAPI.addToDownloads(productId, productData);
      alert('Product added to downloads successfully!');
    } catch (error) {
      alert('Failed to add to downloads: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading purchased products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Purchased Products</h1>
      
      {purchasedProducts.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold mb-2">No Purchases Yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            When you purchase products, they will appear here for download.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedProducts.map((item, index) => (
            <div key={index} className="bg-white dark:bg-neutral-900 rounded-xl shadow overflow-hidden">
              <div className="relative">
                <img 
                  src={item.product.image_url} 
                  alt={item.product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.order_status)}`}>
                    {item.order_status.charAt(0).toUpperCase() + item.order_status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{item.product.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                  {item.product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-neutral-500">
                    Purchased: {new Date(item.order_date).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-green-600">
                    ${item.price_paid}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {getStatusIcon(item.order_status)}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Order #{item.order_id.slice(-8)}
                  </span>
                </div>
                
                <button
                  onClick={() => handleDownload(item.product._id, {
                    title: item.product.title,
                    description: item.product.description,
                    image_url: item.product.image_url,
                    original_url: item.product.original_url,
                    category: item.product.category,
                    price: item.price_paid,
                    order_id: item.order_id,
                    purchased_at: item.order_date
                  })}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <FaDownload />
                  Add to Downloads
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

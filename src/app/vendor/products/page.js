"use client";
import { useEffect, useState } from "react";
import { productAPI } from "../../../utils/api";
import { FaBoxOpen } from "react-icons/fa";

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    const fetchProducts = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Please login to view products');
          setLoading(false);
          return;
        }

        setLoading(true);
        const productsData = await productAPI.getVendorProducts();
        setProducts(productsData);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaBoxOpen /> My Products</h1>
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-800">
                <th className="p-3">Title</th>
                <th className="p-3">Price</th>
                <th className="p-3">Image</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-t hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3">{p.price}</td>
                  <td className="p-3"><img src={p.image_url} alt={p.title} className="w-16 h-16 object-cover rounded shadow" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
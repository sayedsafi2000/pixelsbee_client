"use client";
import { useEffect, useState } from "react";
import { FaBoxOpen, FaCheck, FaTimes, FaEye, FaEyeSlash, FaClock } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      router.push('/');
      return;
    }
    
    fetchProducts();
  }, [router, statusFilter]);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const url = statusFilter === 'all' 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/products`
        : `${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/products?status=${statusFilter}`;
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Products data received:', data); // Debug log
        setProducts(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch products:', res.status, res.statusText);
        setError('Failed to load products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error loading products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (productId) => {
    try {
      console.log('Approving product with ID:', productId); // Debug log
      
      // Validate product ID
      if (!productId || productId === 'undefined') {
        console.error('Invalid product ID:', productId);
        return;
      }
      
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/products/${productId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        console.log('Product approved successfully'); // Debug log
        // Refresh the products list
        fetchProducts();
      } else {
        console.error('Failed to approve product:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  const handleReject = async (productId, reason) => {
    try {
      console.log('Rejecting product with ID:', productId, 'Reason:', reason); // Debug log
      
      // Validate product ID
      if (!productId || productId === 'undefined') {
        console.error('Invalid product ID:', productId);
        return;
      }
      
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/products/${productId}/reject`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (res.ok) {
        console.log('Product rejected successfully'); // Debug log
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedProduct(null);
        // Refresh the products list
        fetchProducts();
      } else {
        console.error('Failed to reject product:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
    }
  };

  const openRejectModal = (product) => {
    setSelectedProduct(product);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <FaClock className="w-3 h-3" /> },
      active: { color: 'bg-green-100 text-green-800', icon: <FaCheck className="w-3 h-3" /> },
      rejected: { color: 'bg-red-100 text-red-800', icon: <FaTimes className="w-3 h-3" /> },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: <FaEyeSlash className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getActions = (product) => {
    const productId = product._id || product.id; // Handle both MongoDB _id and regular id
    
    if (product.status === 'pending') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(productId)}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => openRejectModal(product)}
            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      );
    } else if (product.status === 'rejected') {
      return (
        <div className="text-xs text-gray-500">
          {product.rejection_reason && (
            <div title={product.rejection_reason} className="truncate max-w-32">
              Reason: {product.rejection_reason}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-xs text-gray-500">
          {product.approved_by && (
            <div>Approved by: {product.approved_by.name}</div>
          )}
        </div>
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaBoxOpen /> Products</h1>
      
      {/* Status Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
        >
          <option value="all">All Products</option>
          <option value="pending">Pending Approval</option>
          <option value="active">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2">Loading products...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => fetchProducts()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>No products found</p>
          </div>
        ) : (
          <table className="w-full border rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Vendor</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id || p.id} className="border-t hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3">${p.price}</td>
                  <td className="p-3">
                    <img src={p.image_url} alt={p.title} className="w-16 h-16 object-cover rounded shadow" />
                  </td>
                  <td className="p-3">{p.vendor_id?.name || '-'}</td>
                  <td className="p-3">{getStatusBadge(p.status)}</td>
                  <td className="p-3">{getActions(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Reject Product</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to reject "{selectedProduct.title}"?
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for rejection:
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              rows="3"
              placeholder="Enter reason for rejection..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleReject(selectedProduct._id || selectedProduct.id, rejectReason)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                disabled={!rejectReason.trim()}
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
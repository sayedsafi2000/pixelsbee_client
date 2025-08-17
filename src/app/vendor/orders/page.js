"use client";
import { useEffect, useState } from "react";
import { vendorAPI } from "../../../utils/api";
import { useRouter } from "next/navigation";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Please login to view orders');
          setLoading(false);
          return;
        }

        setLoading(true);
        const ordersData = await vendorAPI.getOrders();
        setOrders(ordersData);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      const response = await vendorAPI.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      // Show success message
      if (response.downloadsAdded) {
        setSuccessMessage(`Order status updated to ${newStatus} and products added to user downloads!`);
        setTimeout(() => setSuccessMessage(''), 5000); // Hide after 5 seconds
      } else {
        setSuccessMessage(`Order status updated to ${newStatus}!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status: ' + err.message);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'shipped':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'delivered':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'paid':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'refunded':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusActions = (order) => {
    const actions = [];
    
    switch (order.status) {
      case 'pending':
        actions.push(
          <button
            key="approve"
            onClick={() => handleStatusUpdate(order._id, 'approved')}
            disabled={updatingStatus[order._id]}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {updatingStatus[order._id] ? 'Updating...' : 'Approve'}
          </button>,
          <button
            key="reject"
            onClick={() => handleStatusUpdate(order._id, 'rejected')}
            disabled={updatingStatus[order._id]}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {updatingStatus[order._id] ? 'Updating...' : 'Reject'}
          </button>
        );
        break;
      case 'approved':
        actions.push(
          <button
            key="ship"
            onClick={() => handleStatusUpdate(order._id, 'shipped')}
            disabled={updatingStatus[order._id]}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {updatingStatus[order._id] ? 'Updating...' : 'Mark Shipped'}
          </button>
        );
        break;
      case 'shipped':
        actions.push(
          <button
            key="deliver"
            onClick={() => handleStatusUpdate(order._id, 'delivered')}
            disabled={updatingStatus[order._id]}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            {updatingStatus[order._id] ? 'Updating...' : 'Mark Delivered'}
          </button>
        );
        break;
    }
    
    return actions;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading orders...</div>
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
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-8 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            When customers purchase your products, their orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    {getStatusActions(order)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    {item.product_id?.image_url && (
                      <img 
                        src={item.product_id.image_url} 
                        alt={item.product_id.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_id?.title || 'Product'}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Quantity: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-red-600">${order.total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Customer: {order.user_id?.name || 'Unknown'} ({order.user_id?.email || 'No email'})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

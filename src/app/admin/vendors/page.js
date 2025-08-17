"use client";
import { FaUserTie, FaCheck, FaTimes, FaEye, FaUserCheck, FaUserTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminVendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/');
      return;
    }
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Vendors data:', data); // Debug logging
        setVendors(data);
      } else {
        setError('Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Error loading vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (vendorId, action) => {
    try {
      // Debug logging
      console.log('Vendor ID:', vendorId);
      console.log('Action:', action);
      
      // Validate vendor ID
      if (!vendorId || vendorId === 'undefined') {
        alert('Invalid vendor ID');
        return;
      }
      
      setActionLoading(prev => ({ ...prev, [vendorId]: true }));
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/admin/vendors/${vendorId}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Refresh the vendors list
        await fetchVendors();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Action failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [vendorId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'blocked':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Blocked</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchVendors}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <div className="text-sm text-neutral-500">
          {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center gap-3">
            <FaUserCheck className="text-2xl text-green-500" />
            <div>
              <p className="text-sm text-neutral-500">Approved Vendors</p>
              <p className="text-2xl font-bold">{vendors.filter(v => v.status === 'approved').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center gap-3">
            <FaUserTie className="text-2xl text-yellow-500" />
            <div>
              <p className="text-sm text-neutral-500">Pending Approval</p>
              <p className="text-2xl font-bold">{vendors.filter(v => v.status === 'pending').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow p-6">
          <div className="flex items-center gap-3">
            <FaUserTimes className="text-2xl text-red-500" />
            <div>
              <p className="text-sm text-neutral-500">Blocked Vendors</p>
              <p className="text-2xl font-bold">{vendors.filter(v => v.status === 'blocked').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold">All Vendors</h2>
        </div>
        
        {vendors.length === 0 ? (
          <div className="p-8 text-center">
            <FaUserTie className="text-4xl text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-500">No vendors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {vendors.map((vendor) => (
                  <tr key={vendor._id || vendor.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {vendor.profile_pic_url ? (
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={vendor.profile_pic_url} 
                              alt={vendor.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                              {vendor.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {vendor.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {vendor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(vendor.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {vendor.status === 'pending' && (
                          <button
                            onClick={() => handleAction(vendor._id || vendor.id, 'approve')}
                            disabled={actionLoading[vendor._id || vendor.id]}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading[vendor._id || vendor.id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                            ) : (
                              <FaCheck className="mr-1" />
                            )}
                            Approve
                          </button>
                        )}
                        
                        {vendor.status !== 'blocked' ? (
                          <button
                            onClick={() => handleAction(vendor._id || vendor.id, 'block')}
                            disabled={actionLoading[vendor._id || vendor.id]}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading[vendor._id || vendor.id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                            ) : (
                              <FaTimes className="mr-1" />
                            )}
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(vendor._id || vendor.id, 'approve')}
                            disabled={actionLoading[vendor._id || vendor.id]}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {actionLoading[vendor._id || vendor.id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                            ) : (
                              <FaCheck className="mr-1" />
                            )}
                            Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
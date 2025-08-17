'use client';

import { useState, useEffect } from 'react';
import { productAPI, authAPI } from '@/utils/api';

export default function TestAPIPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setMessage('');
    
    try {
      // Test basic connection
      const result = await productAPI.getAllProducts();
      setProducts(result.products || result || []);
      setMessage('✅ API connection successful! Products loaded.');
    } catch (err) {
      setError(`❌ API connection failed: ${err.message}`);
      console.error('API test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    setMessage('');
    
    try {
      // Test auth endpoint (should return error without token, but connection should work)
      const result = await authAPI.user.getProfile();
      setMessage('✅ Auth API working!');
    } catch (err) {
      if (err.message.includes('No token provided') || err.message.includes('Unauthorized')) {
        setMessage('✅ Auth API working! (Expected error: No token provided)');
      } else {
        setError(`❌ Auth API failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test API Connection</h2>
            <button
              onClick={testConnection}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Products API'}
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Auth API</h2>
            <button
              onClick={testAuth}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Auth API'}
            </button>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Products from API</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product) => (
                <div key={product._id || product.id} className="border rounded-lg p-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold text-sm">{product.title}</h3>
                  <p className="text-gray-600 text-xs">${product.price}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products loaded yet</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}</p>
            <p><strong>API Base:</strong> {process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api</p>
            <p><strong>Products Endpoint:</strong> /products</p>
            <p><strong>Auth Endpoint:</strong> /auth</p>
          </div>
        </div>
      </div>
    </div>
  );
}

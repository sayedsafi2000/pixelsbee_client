const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  // Don't add Authorization header for auth endpoints
  const isAuthEndpoint = endpoint.startsWith('/auth/');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && !isAuthEndpoint && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Log API configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}

// Authentication APIs
export const authAPI = {
  // User registration
  register: async (userData) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User login
  login: async (credentials) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// User APIs
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/api/user/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return apiRequest('/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // Get user stats
  getStats: async () => {
    return apiRequest('/api/user/stats');
  },

  // Get user favorites
  getFavorites: async () => {
    return apiRequest('/api/user/favorites');
  },

  // Add to favorites
  addToFavorites: async (imageId, imageData) => {
    return apiRequest('/api/user/favorites', {
      method: 'POST',
      body: JSON.stringify({ imageId, imageData }),
    });
  },

  // Remove from favorites
  removeFromFavorites: async (imageId) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token provided');
    }
    return apiRequest(`/api/user/favorites/${imageId}`, {
      method: 'DELETE',
    });
  },

  // Check if favorited
  checkFavorite: async (imageId) => {
    const token = getAuthToken();
    if (!token) {
      return { isFavorite: false };
    }
    try {
      return await apiRequest(`/api/user/favorites/${imageId}/check`);
    } catch (error) {
      return { isFavorite: false };
    }
  },

  // Get user downloads
  getDownloads: async () => {
    return apiRequest('/api/user/downloads');
  },

  // Get user's purchased products
  getPurchasedProducts: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token provided');
    }
    return apiRequest('/api/user/purchased');
  },

  // Add to downloads
  addToDownloads: async (imageId, imageData) => {
    return apiRequest('/api/user/downloads', {
      method: 'POST',
      body: JSON.stringify({ imageId, imageData }),
    });
  },

  // Get user cart
  getCart: async () => {
    return apiRequest('/api/user/cart');
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    return apiRequest('/api/user/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    return apiRequest('/api/user/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Clear cart
  clearCart: async () => {
    return apiRequest('/api/user/cart/clear', {
      method: 'POST',
    });
  },
};

// Cart APIs
export const cartAPI = {
  // Get user cart
  getCart: async () => {
    return apiRequest('/api/user/cart');
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    return apiRequest('/api/user/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    return apiRequest('/api/user/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Clear cart
  clearCart: async () => {
    return apiRequest('/api/user/cart/clear', {
      method: 'POST',
    });
  },
};

// Product APIs
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    return apiRequest('/api/products');
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    return apiRequest(`/api/products?category=${category}`);
  },

  // Get product categories
  getCategories: async () => {
    return apiRequest('/api/products/categories');
  },

  // Get vendor's own products
  getVendorProducts: async () => {
    return apiRequest('/api/products/my');
  },

  // Search products
  searchProducts: async (query) => {
    return apiRequest(`/api/products?q=${encodeURIComponent(query)}`);
  },

  // Get single product
  getProduct: async (productId) => {
    return apiRequest(`/api/products/${productId}`);
  },

  // Create product (vendor only)
  createProduct: async (productData) => {
    return apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  // Update product (vendor only)
  updateProduct: async (productId, productData) => {
    return apiRequest(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  // Delete product (vendor only)
  deleteProduct: async (productId) => {
    return apiRequest(`/api/products/${productId}`, {
      method: 'DELETE',
    });
  },

  // Upload image (vendor only)
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  },

  // Download product (authenticated)
  downloadProduct: async (productId) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Download failed! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Product download failed:', error);
      throw error;
    }
  },
};

// Vendor APIs
export const vendorAPI = {
  // Get vendor profile
  getProfile: async () => {
    return apiRequest('/api/vendor/profile');
  },

  // Update vendor profile
  updateProfile: async (profileData) => {
    return apiRequest('/api/vendor/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change vendor password
  changePassword: async (passwordData) => {
    return apiRequest('/api/vendor/password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // Get vendor products
  getMyProducts: async () => {
    return apiRequest('/api/vendor/products');
  },

  // Get vendor orders
  getOrders: async () => {
    return apiRequest('/api/vendor/orders');
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    return apiRequest(`/api/vendor/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Admin APIs
export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    return apiRequest('/api/admin/stats');
  },

  // Get all vendors
  getVendors: async () => {
    return apiRequest('/api/admin/vendors');
  },

  // Approve vendor
  approveVendor: async (vendorId) => {
    return apiRequest(`/api/admin/vendors/${vendorId}/approve`, {
      method: 'PUT',
    });
  },

  // Block vendor
  blockVendor: async (vendorId) => {
    return apiRequest(`/api/admin/vendors/${vendorId}/block`, {
      method: 'PUT',
    });
  },

  // Get all users
  getAllUsers: async () => {
    return apiRequest('/api/admin/users');
  },

  // Block user
  blockUser: async (userId) => {
    return apiRequest(`/api/admin/users/${userId}/block`, {
      method: 'PUT',
    });
  },

  // Unblock user
  unblockUser: async (userId) => {
    return apiRequest(`/api/admin/users/${userId}/unblock`, {
      method: 'PUT',
    });
  },

  // Get all products (admin view)
  getAllProducts: async () => {
    return apiRequest('/api/admin/products');
  },
};

// Order APIs
export const orderAPI = {
  // Create order
  createOrder: async (orderData) => {
    return apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get order analytics
  getAnalytics: async () => {
    return apiRequest('/api/orders/analytics');
  },
};

export default {
  auth: authAPI,
  user: userAPI,
  cart: cartAPI,
  product: productAPI,
  vendor: vendorAPI,
  admin: adminAPI,
  order: orderAPI,
}; 
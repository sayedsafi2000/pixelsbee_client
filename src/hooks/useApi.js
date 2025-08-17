import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (apiCall, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
};

// Specific hooks for common operations
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { productAPI } = await import('@/utils/api');
      const result = await productAPI.getAllProducts(filters);
      setProducts(result.products || result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch products';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      const { productAPI } = await import('@/utils/api');
      const result = await productAPI.searchProducts(query);
      setProducts(result.products || result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Search failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { productAPI } = await import('@/utils/api');
      const result = await productAPI.createProduct(productData);
      
      // Refresh products list
      await fetchProducts();
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    searchProducts,
    createProduct,
  };
};

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { cartAPI } = await import('@/utils/api');
      const result = await cartAPI.getCart();
      setCart(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch cart';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const { cartAPI } = await import('@/utils/api');
      const result = await cartAPI.addToCart(productId, quantity);
      
      // Refresh cart
      await fetchCart();
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add to cart';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);
      
      const { cartAPI } = await import('@/utils/api');
      const result = await cartAPI.removeFromCart(productId);
      
      // Refresh cart
      await fetchCart();
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove from cart';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { cartAPI } = await import('@/utils/api');
      const result = await cartAPI.clearCart();
      
      // Clear local cart
      setCart([]);
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to clear cart';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart,
  };
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { userAPI } = await import('@/utils/api');
      const result = await userAPI.getFavorites();
      setFavorites(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch favorites';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToFavorites = useCallback(async (imageId, imageData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { userAPI } = await import('@/utils/api');
      const result = await userAPI.addToFavorites(imageId, imageData);
      
      // Refresh favorites
      await fetchFavorites();
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add to favorites';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  const removeFromFavorites = useCallback(async (imageId) => {
    try {
      setLoading(true);
      setError(null);
      
      const { userAPI } = await import('@/utils/api');
      const result = await userAPI.removeFromFavorites(imageId);
      
      // Refresh favorites
      await fetchFavorites();
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove from favorites';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
  };
};

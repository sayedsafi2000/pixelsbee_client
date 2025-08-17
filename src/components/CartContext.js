"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { cartAPI } from "../utils/api";
import { useAuth } from "./AuthProvider";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export default function CartProvider({ children }) {
  const { isAuthenticated, mounted } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false to prevent hydration mismatch

  // Load cart from backend or localStorage
  useEffect(() => {
    if (!mounted) return; // Only run after component is mounted
    
    async function loadCart() {
      setLoading(true);
      console.log('Loading cart... isAuthenticated:', isAuthenticated); // Debug log
      
      if (isAuthenticated) {
        try {
          console.log('Loading cart from backend...'); // Debug log
          const data = await cartAPI.getCart();
          console.log('Backend cart data:', data); // Debug log
          setCart(data || []);
        } catch (error) {
          console.error('Error loading cart from backend:', error); // Debug log
          setCart([]);
        }
      } else {
        // Only access localStorage after component is mounted (client-side)
        if (typeof window !== 'undefined') {
          try {
            const local = localStorage.getItem("cart");
            console.log('Loading cart from localStorage:', local); // Debug log
            setCart(local ? JSON.parse(local) : []);
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            setCart([]);
          }
        } else {
          setCart([]);
        }
      }
      setLoading(false);
    }
    loadCart();
  }, [isAuthenticated, mounted]);

  // Sync local cart to localStorage
  useEffect(() => {
    if (!isAuthenticated && mounted && typeof window !== 'undefined') {
      try {
        localStorage.setItem("cart", JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isAuthenticated, mounted]);

  // Add to cart
  const add = async (product, quantity = 1) => {
    console.log('=== ADD TO CART DEBUG ===');
    console.log('Product:', product);
    console.log('Quantity:', quantity);
    console.log('isAuthenticated:', isAuthenticated);
    
    const productId = String(product._id || product.product_id || product.id || '');
    console.log('Product ID:', productId);
    
    if (isAuthenticated) {
      console.log('Adding to backend cart...');
      try {
        await cartAPI.addToCart(productId, quantity);
        console.log('Successfully added to backend cart');
        const data = await cartAPI.getCart();
        console.log('Updated backend cart data:', data);
        setCart(data || []);
      } catch (error) {
        console.error('Error adding to backend cart:', error);
      }
    } else {
      console.log('Adding to local cart...');
      setCart(prev => {
        console.log('Previous cart:', prev);
        const exists = prev.find(item => String(item._id || item.product_id || item.id) === productId);
        console.log('Item exists:', exists);
        if (exists) {
          const newCart = prev.map(item => String(item._id || item.product_id || item.id) === productId ? { ...item, quantity: (item.quantity || 1) + quantity } : item);
          console.log('Updated cart (existing item):', newCart);
          return newCart;
        }
        // Ensure the product has the correct structure for the cart
        const cartItem = {
          ...product,
          _id: String(productId),
          product_id: String(productId),
          id: String(productId),
          // Ensure consistent field names
          title: product.title || product.name,
          name: product.name || product.title,
          image_url: product.image_url || product.imgWatermark,
          imgWatermark: product.imgWatermark || product.image_url,
          quantity: quantity
        };
        const newCart = [...prev, cartItem];
        console.log('Updated cart (new item):', newCart);
        return newCart;
      });
    }
  };

  // Remove from cart
  const remove = async (productId) => {
    console.log('Removing from cart:', productId);
    const productIdStr = String(productId || '');
    console.log('Product ID string:', productIdStr);
    if (isAuthenticated) {
      await cartAPI.removeFromCart(productIdStr);
      const data = await cartAPI.getCart();
      setCart(data);
    } else {
      setCart(prev => {
        console.log('Previous cart before remove:', prev);
        const newCart = prev.filter(item => {
          // Handle nested product_id structure
          const itemProductId = item.product_id?._id || item.product_id || item._id || item.id;
          return String(itemProductId || '') !== productIdStr;
        });
        console.log('Cart after remove:', newCart);
        return newCart;
      });
    }
  };

  // Clear cart
  const clear = async () => {
    if (isAuthenticated) {
      await cartAPI.clearCart();
      setCart([]);
    } else {
      setCart([]);
    }
  };

  const value = { cart, add, remove, clear, loading };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
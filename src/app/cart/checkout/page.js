"use client";
import { useCart } from "../../../components/CartContext";
import { useAuth } from "../../../components/AuthProvider";
import { orderAPI } from "../../../utils/api";
import Link from "next/link";
import { FaArrowLeft, FaShoppingCart, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, clear } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [checkedOut, setCheckedOut] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Debug: Log cart items to see their structure
  console.log('Checkout cart items:', cart);

  const total = cart.reduce((sum, item) => {
    const price = Number(item.product_id?.price || item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setError('Please log in to complete your purchase');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Prepare order data
      const orderItems = cart.map(item => ({
        product_id: item.product_id?._id || item.product_id || item._id || item.id,
        vendor_id: item.product_id?.vendor_id || item.vendor_id || item.user_id,
        quantity: item.quantity || 1,
        price: Number(item.product_id?.price || item.price) || 0
      }));

      const orderData = {
        items: orderItems,
        total: total,
        status: 'pending'
      };

      console.log('Creating order:', orderData);

      // Create order
      const order = await orderAPI.createOrder(orderData);
      console.log('Order created:', order);

      // Clear cart and show success
      setCheckedOut(true);
      clear();
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (checkedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <FaCheckCircle className="text-6xl text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Checkout Complete!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Thank you for your purchase. Your downloads will be available in your dashboard after payment integration.</p>
        <Link href="/" className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold shadow-lg hover:bg-green-700 transition">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" className="text-red-600 hover:text-red-800 transition flex items-center gap-2">
            <FaArrowLeft /> Back to Cart
          </Link>
          <FaShoppingCart className="text-2xl text-red-600 ml-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Checkout</h1>
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
            <Link href="/explore" className="mt-4 inline-block px-6 py-3 bg-red-600 text-white rounded-full font-semibold shadow-lg hover:bg-red-700 transition">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 mb-8">
              {cart.map((item, idx) => (
                <div key={String(item._id || item.id || item.product_id?._id || item.product_id || '')} className="flex items-center gap-4 py-4">
                  <img 
                    src={item.product_id?.image_url || item.imgWatermark || item.image_url} 
                    alt={item.product_id?.title || item.name || item.title || 'Product'} 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" 
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-800 dark:text-white">
                      {item.product_id?.title || item.name || item.title || 'Product'}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      {item.product_id?.category || item.category || 'General'}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    ${(Number(item.product_id?.price || item.price) || 0).toFixed(2)}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">x{item.quantity || 1}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mb-8">
              <div className="text-xl font-bold text-gray-800 dark:text-white">Total</div>
              <div className="text-2xl font-bold text-red-600">${total.toFixed(2)}</div>
            </div>
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <button
              onClick={handleCheckout}
              disabled={processing || !isAuthenticated}
              className={`w-full py-4 rounded-lg font-semibold text-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                processing || !isAuthenticated
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
              }`}
            >
              {processing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : !isAuthenticated ? (
                'Please Log In to Checkout'
              ) : (
                'Complete Purchase'
              )}
            </button>
            
            {!isAuthenticated && (
              <div className="mt-4 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  You need to be logged in to complete your purchase.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
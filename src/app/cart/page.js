"use client";
import { useCart } from "../../components/CartContext";
import Link from "next/link";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft, FaCreditCard, FaTruck, FaShieldAlt, FaHeart } from "react-icons/fa";

export default function CartPage() {
  const { cart, remove, clear, loading, add } = useCart();
  const total = cart.reduce((sum, item) => {
    const price = Number(item.product_id?.price || item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  // Debug: Log cart items to see their structure
  console.log('Cart items:', cart);
  console.log('Cart items with IDs:', cart.map(item => ({
    _id: item._id,
    id: item.id,
    product_id: item.product_id,
    price: item.price,
    quantity: item.quantity,
    _idType: typeof item._id,
    idType: typeof item.id,
    product_idType: typeof item.product_id,
    priceType: typeof item.price,
    quantityType: typeof item.quantity
  })));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200 border-t-red-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">Loading your cart...</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Please wait while we fetch your items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/explore" 
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              <span className="font-medium">Continue Shopping</span>
            </Link>
            <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaShoppingCart className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Shopping Cart</h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="xl:col-span-2">
            {cart.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShoppingCart className="text-4xl text-neutral-400 dark:text-neutral-500" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Your cart is empty</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any products to your cart yet. Start exploring our amazing collection!
                </p>
                <Link 
                  href="/explore" 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-2xl shadow-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200"
                >
                  <FaHeart className="text-lg" />
                  Explore Products
                </Link>
            </div>
          ) : (
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div 
                    key={String(item._id || item.id || item.product_id?._id || item.product_id || '')} 
                    className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-6 border border-neutral-100 dark:border-neutral-800 hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        <img 
                          src={item.product_id?.image_url || item.imgWatermark || item.image_url} 
                          alt={item.product_id?.title || item.name || item.title || 'Product'} 
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl shadow-lg border-2 border-neutral-100 dark:border-neutral-800 group-hover:border-red-200 dark:group-hover:border-red-800 transition-colors" 
                        />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                          {item.quantity || 1}
                        </div>
                      </div>

                      {/* Product Details */}
                  <div className="flex-1 min-w-0">
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <Link 
                              href={`/${String(item.product_id?._id || item._id || item.id || item.product_id || '')}`} 
                              className="font-bold text-xl text-neutral-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-2"
                            >
                              {item.product_id?.title || item.name || item.title || 'Product'}
                            </Link>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                ${(Number(item.product_id?.price || item.price) || 0).toFixed(2)}
                              </span>
                              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                per item
                              </span>
                            </div>
                  </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1">
                    <button 
                      onClick={() => {
                        const productData = item.product_id || item;
                        add(productData, -1);
                      }} 
                      disabled={(item.quantity || 1) <= 1} 
                                className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                    >
                                <FaMinus className="text-sm" />
                    </button>
                              <span className="px-4 py-2 text-lg font-bold text-neutral-900 dark:text-white min-w-[3rem] text-center">
                                {item.quantity || 1}
                              </span>
                    <button 
                      onClick={() => {
                        const productData = item.product_id || item;
                        add(productData, 1);
                      }} 
                                className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center shadow-sm"
                    >
                                <FaPlus className="text-sm" />
                    </button>
                  </div>
                            
                  <button 
                    onClick={() => {
                      const productId = item.product_id?._id || item.product_id || item._id || item.id;
                      remove(String(productId || ''));
                    }} 
                              className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                            >
                              <FaTrash className="text-sm" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl p-8 border border-neutral-100 dark:border-neutral-800 sticky top-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-3">
                <FaCreditCard className="text-red-500" />
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-600 dark:text-neutral-400">Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                    <FaTruck className="text-green-500" />
                    Shipping
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                    <FaShieldAlt className="text-blue-500" />
                    Protection
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Included</span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">Total</span>
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">${total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  All prices include applicable taxes
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  href="/cart/checkout"
                  className={`w-full block text-center py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl text-lg font-bold shadow-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 ${
                    cart.length === 0 ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  tabIndex={cart.length === 0 ? -1 : 0}
                >
                  <div className="flex items-center justify-center gap-3">
                    <FaCreditCard className="text-lg" />
                    Proceed to Checkout
                  </div>
                </Link>
                
                {cart.length > 0 && (
                  <button 
                    onClick={clear} 
                    className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-2xl font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
                  >
                    Clear Cart
                  </button>
          )}
        </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-center gap-6 text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-green-500" />
                    <span className="text-sm">Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaTruck className="text-blue-500" />
                    <span className="text-sm">Fast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-red-500" />
                    <span className="text-sm">Quality</span>
                  </div>
                </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
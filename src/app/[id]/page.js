"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { productAPI, userAPI } from "../../utils/api";
import { useCart } from "../../components/CartContext";
import { FaHeart, FaDownload, FaShare, FaArrowLeft, FaShoppingCart, FaEye, FaTimes, FaStar, FaUser, FaTag, FaDollarSign } from "react-icons/fa";

function ImageModal({ src, alt, open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-2xl transition-all duration-300 hover:scale-110 z-10">
          <FaTimes className="text-xl" />
        </button>
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
          style={{ maxWidth: '95vw', maxHeight: '95vh' }}
        />
      </div>
    </div>
  );
}

export default function SingleImagePage() {
  const router = useRouter();
  const { id } = useParams();
  const [image, setImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [related, setRelated] = useState([]);
  const [reacted, setReacted] = useState(false);
  const [reactCount, setReactCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([
    { author: "Alice", text: "Absolutely stunning! The colors are incredible.", rating: 5 },
    { author: "John", text: "This is exactly what I was looking for. Perfect composition!", rating: 5 },
    { author: "Sarah", text: "Love the artistic style and quality.", rating: 4 },
  ]);
  const [commentInput, setCommentInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { add: addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const products = await productAPI.getAllProducts();
        setAllImages(products);
        
        // Find the product by ID
        const product = products.find(p => p._id == id || p.id == id);
        
        if (!product) {
          setError("Product not found");
          return;
        }
        
        // Transform product to match expected format
        const transformedProduct = {
          id: product._id || product.id,
          title: product.title,
          vendor_name: product.vendor_id?.name || 'Unknown Vendor',
          vendor_profile_pic_url: product.vendor_id?.profile_pic_url || null,
          image_url: product.image_url,
          original_url: product.original_url,
          price: product.price,
          category: product.category,
          description: product.description,
          status: product.status
        };
        
        setImage(transformedProduct);
        setReactCount(Math.floor(Math.random() * 50) + 10); // Random react count for demo
        
        // Find related products by category
        const relatedProducts = products.filter(p => 
          p.category === product.category && (p._id != id && p.id != id)
        ).slice(0, 8).map(p => ({
          id: p._id || p.id,
          title: p.title,
          vendor_name: p.vendor_id?.name || 'Unknown Vendor',
          vendor_profile_pic_url: p.vendor_id?.profile_pic_url || null,
          image_url: p.image_url,
          price: p.price,
          category: p.category
        }));
        
        setRelated(relatedProducts);
      } catch (error) {
        console.error('Error loading product:', error);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 font-semibold text-lg">Loading amazing content...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">😞</div>
          <p className="text-red-600 font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!image) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🔍</div>
          <p className="text-red-600 font-semibold text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (image.price > 0) {
      // For paid products, use secure download
      try {
        await userAPI.addToDownloads(image.id, image);
        showToastMessage(`"${image.title}" added to downloads! ⬇️`);
      } catch (error) {
        showToastMessage(error.message || 'Download failed. You may need to purchase this product first.');
      }
    } else {
      // For free products, download directly
      const link = document.createElement('a');
      link.href = image.image_url;
      link.download = `${image.title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToastMessage(`"${image.title}" downloaded successfully! ⬇️`);
    }
  };

  const handleReact = () => {
    setReacted(!reacted);
    setReactCount((prev) => prev + (reacted ? -1 : 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: image.title,
        url: window.location.href,
      });
      showToastMessage("Shared successfully! 🔗");
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToastMessage("Link copied to clipboard! 📋");
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleAddToCart = () => {
    addToCart(image, 1);
    showToastMessage(`"${image.title}" added to cart! 🛒`);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (commentInput.trim()) {
      setComments((prev) => [
        ...prev,
        { author: "You", text: commentInput.trim(), rating: 5 },
      ]);
      setCommentInput("");
    }
  };

  const averageRating = comments.reduce((acc, comment) => acc + comment.rating, 0) / comments.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <ImageModal src={image.image_url} alt={image.title} open={modalOpen} onClose={() => setModalOpen(false)} />
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-500 flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <FaShoppingCart className="text-white text-sm" />
            </div>
            <span className="font-semibold">{toastMessage}</span>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-2 text-white/80 hover:text-white transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-red-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <FaArrowLeft className="text-sm" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Image */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-red-100 to-red-200 p-2">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-auto rounded-2xl cursor-pointer transition-all duration-500 group-hover:scale-105"
                  onClick={() => setModalOpen(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                {/* Action Buttons - Left side (appear on hover) */}
                <div className="absolute top-4 left-4 flex flex-col gap-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={handleReact} 
                    className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm ${
                      reacted 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-white/90 text-red-600 hover:bg-white border-2 border-red-600'
                    }`}
                    title={`${reactCount} ${reacted ? 'Loved' : 'Love'}`}
                  >
                    <FaHeart className={`text-lg ${reacted ? 'animate-pulse' : ''}`} />
                  </button>
                  
                  {image.price > 0 ? (
                    <button 
                      onClick={handleAddToCart} 
                      className="flex items-center justify-center w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
                      title={`Add to Cart - $${image.price}`}
                    >
                      <FaShoppingCart className="text-lg" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleDownload} 
                      className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
                      title="Download Free"
                    >
                      <FaDownload className="text-lg" />
                    </button>
                  )}
                  
                  <button 
                    onClick={handleShare} 
                    className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
                    title="Share"
                  >
                    <FaShare className="text-lg" />
                  </button>
                </div>

                {/* Eye Button - Right side (appear on hover) */}
                <button 
                  onClick={() => setModalOpen(true)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-red-600 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  title="View Full Size"
                >
                  <FaEye className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            {/* Product Info */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100">
              <div className="space-y-6">
                {/* Title and Rating */}
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{image.title}</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`text-lg ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-gray-600 font-semibold">{averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500">({comments.length} reviews)</span>
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-red-200">
                    {image.vendor_profile_pic_url ? (
                      <img 
                        src={image.vendor_profile_pic_url} 
                        alt={image.vendor_name || 'Vendor'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center ${image.vendor_profile_pic_url ? 'hidden' : 'flex'}`}>
                      <FaUser className="text-white text-2xl" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{image.vendor_name || 'Vendor'}</h3>
                    <p className="text-gray-600">Professional Photographer</p>
                  </div>
                </div>

                {/* Price and Category */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full">
                    <FaTag className="text-red-600" />
                    <span className="font-semibold text-red-600">{image.category}</span>
                  </div>
                  {image.price > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                      <FaDollarSign className="text-green-600" />
                      <span className="font-bold text-green-600 text-xl">${image.price}</span>
                    </div>
                  )}
                  {image.price === 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                      <FaDownload className="text-blue-600" />
                      <span className="font-bold text-blue-600">Free Download</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {image.description && (
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{image.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Comments</h3>
              
              {/* Comment Form */}
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-red-200 focus:border-red-600 focus:outline-none transition-colors"
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Post
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {comments.map((comment, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                          <FaUser className="text-white text-sm" />
                        </div>
                        <span className="font-semibold text-gray-900">{comment.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, j) => (
                          <FaStar key={j} className={`text-sm ${j < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Images */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <Link 
                  key={String(item.id || '')} 
                  href={`/${String(item.id || '')}`} 
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-red-100 to-red-200 p-2 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-48 object-cover rounded-xl" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    
                                         {/* Overlay Info */}
                     <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30">
                           {item.vendor_profile_pic_url ? (
                             <img 
                               src={item.vendor_profile_pic_url} 
                               alt={item.vendor_name || 'Vendor'} 
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 e.target.style.display = 'none';
                                 e.target.nextSibling.style.display = 'flex';
                               }}
                             />
                           ) : null}
                           <div className={`w-full h-full bg-red-600 flex items-center justify-center ${item.vendor_profile_pic_url ? 'hidden' : 'flex'}`}>
                             <FaUser className="text-white text-xs" />
                           </div>
                         </div>
                         <span className="text-xs font-medium">{item.vendor_name || 'Vendor'}</span>
                       </div>
                       <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
                       <div className="flex items-center justify-between text-xs">
                         <span className="font-bold">${item.price || 'Free'}</span>
                       </div>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
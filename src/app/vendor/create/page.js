"use client";
import { useState, useEffect } from "react";
import { productAPI } from "../../../utils/api";
import { FaPlus, FaImage, FaTag, FaDollarSign, FaFileAlt } from "react-icons/fa";
import SearchableDropdown from "../../../components/SearchableDropdown";

export default function VendorCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingOriginal, setUploadingOriginal] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Default categories as fallback
  const defaultCategories = [
    "Photography",
    "Digital Art",
    "Illustration",
    "Vector Graphics",
    "3D Art",
    "Typography",
    "UI/UX Design",
    "Web Templates",
    "Print Design",
    "Other"
  ];

  // Fetch categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const dbCategories = await productAPI.getCategories();
        // Combine database categories with default ones, removing duplicates
        const allCategories = [...new Set([...dbCategories, ...defaultCategories])];
        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(defaultCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleImageUpload = async (file, isOriginal = false) => {
    try {
      if (isOriginal) {
        setUploadingOriginal(true);
      } else {
        setUploadingPreview(true);
      }
      
      const result = await productAPI.uploadImage(file);
      
      if (isOriginal) {
        setOriginalUrl(result.url);
      } else {
        setImageUrl(result.url);
      }
    } catch (error) {
      setError(`Failed to upload ${isOriginal ? 'original' : 'preview'} image: ${error.message}`);
    } finally {
      if (isOriginal) {
        setUploadingOriginal(false);
      } else {
        setUploadingPreview(false);
      }
    }
  };

  const handleProductCreate = async (e) => {
    e.preventDefault();
    if (!title || !description || !price || !category || !imageUrl || !originalUrl) {
      setError("All fields are required including both images");
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      await productAPI.createProduct({
        title,
        description,
        price: parseFloat(price),
        category,
        image_url: imageUrl,
        original_url: originalUrl
      });
      setMessage("Product created successfully! ✨");
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImageUrl("");
      setOriginalUrl("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(`Failed to create product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
              <FaPlus className="text-white text-2xl" />
            </div>
            Create New Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Upload your product with preview and original images</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleProductCreate} className="space-y-6">
            {/* Product Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="Enter product title"
                required
              />
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="Describe your product"
                required
              />
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <SearchableDropdown
                  options={categories}
                  value={category}
                  onChange={setCategory}
                  onAddNew={setNewCategory}
                  placeholder="Select or create category"
                  required
                />
              </div>
            </div>

            {/* Preview Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview Image (Watermarked/Public)</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImageUpload(file, false);
                    }
                  }}
                  className="hidden"
                  id="preview-upload"
                  required
                />
                <label htmlFor="preview-upload" className="cursor-pointer">
                  <FaImage className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {uploadingPreview ? "Uploading..." : "Click to upload preview image"}
                  </p>
                  <p className="text-sm text-gray-500">This will be shown to customers</p>
                </label>
                {imageUrl && (
                  <div className="mt-4">
                    <img src={imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                  </div>
                )}
              </div>
            </div>

            {/* Original Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Image (Full Quality/Private)</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImageUpload(file, true);
                    }
                  }}
                  className="hidden"
                  id="original-upload"
                  required
                />
                <label htmlFor="original-upload" className="cursor-pointer">
                  <FaImage className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {uploadingOriginal ? "Uploading..." : "Click to upload original image"}
                  </p>
                  <p className="text-sm text-gray-500">This will be downloaded by customers after purchase</p>
                </label>
                {originalUrl && (
                  <div className="mt-4">
                    <img src={originalUrl} alt="Original" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex">
                  <div className="text-green-600 dark:text-green-400 text-sm">
                    {message}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold shadow-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Product...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaPlus className="mr-2" />
                  Create Product
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { vendorAPI } from "../../../utils/api";
import { FaUser, FaCamera, FaEdit, FaSave, FaTimes, FaLock, FaEye, FaEyeSlash, FaStore, FaChartLine, FaBox, FaStar, FaDollarSign, FaTrophy, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../../../components/AuthProvider";
import Link from "next/link";

export default function VendorProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", profile_pic_url: "", createdAt: "" });
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [stats, setStats] = useState({ 
    products: 0, 
    sales: 0, 
    rating: 0, 
    earnings: 0,
    memberSince: "" 
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    capital: false,
    special: false,
    number: false
  });

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Password validation function
  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      capital: /[A-Z]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      number: /[0-9]/.test(password)
    };
    setPasswordValidation(validation);
    return validation.length && validation.capital && validation.special && validation.number;
  };

  const handleNewPasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    // Only validate password after component is mounted to prevent hydration mismatch
    if (mounted) {
      validatePassword(newPass);
    }
  };
  
  useEffect(() => { 
    // Redirect if not authenticated
    if (!authUser) {
      router.push('/');
      return;
    }
    
    async function fetchProfile() {
      try {
        const data = await vendorAPI.getProfile();
        setProfile(data);
        setProfilePicUrl(data.profile_pic_url || "");
      } catch (error) {
        console.error('Failed to fetch vendor profile:', error);
      }
    }
    
    async function fetchStats() {
      try {
        setStatsLoading(true);
        // Format the join date from profile data
        const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : "Unknown";
        
        const statsData = { products: 0, sales: 0, rating: 4.5, earnings: 0, memberSince };
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch vendor stats:', error);
        setStats({ products: 0, sales: 0, rating: 4.5, earnings: 0, memberSince: "Unknown" });
      } finally {
        setStatsLoading(false);
      }
    }
    
    // Only fetch data if user is authenticated
    if (authUser) {
      fetchProfile();
    } else {
      setStatsLoading(false);
    }
  }, [authUser, router]);

  // Fetch stats when profile is loaded
  useEffect(() => {
    if (profile.createdAt) {
      async function fetchStats() {
        try {
          setStatsLoading(true);
          // Format the join date from profile data
          const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : "Unknown";
          
          const statsData = { products: 0, sales: 0, rating: 4.5, earnings: 0, memberSince };
          setStats(statsData);
        } catch (error) {
          console.error('Failed to fetch vendor stats:', error);
          setStats({ products: 0, sales: 0, rating: 4.5, earnings: 0, memberSince: "Unknown" });
        } finally {
          setStatsLoading(false);
        }
      }
      fetchStats();
    }
  }, [profile.createdAt]);

  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "pixelsbepreset");
    const res = await fetch("https://api.cloudinary.com/v1_1/dg7az7ll8/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setProfilePicUrl(data.secure_url);
    setUploading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault(); 
    setErr(""); 
    setMsg(""); 
    setProfileLoading(true);
    try {
      await vendorAPI.updateProfile({ name, email, profile_pic_url: profilePicUrl });
      setMsg("Profile updated successfully! ✨"); 
      setEdit(false);
      const updatedUser = { ...profile, name, email, profile_pic_url: profilePicUrl };
      setProfile(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setTimeout(() => setMsg(""), 3000);
    } catch { 
      setErr("Failed to update profile. Please try again."); 
      setTimeout(() => setErr(""), 3000);
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); 
    setErr(""); 
    setMsg(""); 
    
    // Validate new password before submission
    if (newPassword && mounted && !validatePassword(newPassword)) {
      setErr("Please ensure your new password meets all requirements");
      return;
    }
    
    setPasswordLoading(true);
    try {
      await vendorAPI.changePassword({ oldPassword, newPassword });
      setMsg("Password changed successfully! 🔒"); 
      setOldPassword(""); 
      setNewPassword("");
      setPasswordValidation({ length: false, capital: false, special: false, number: false });
      setTimeout(() => setMsg(""), 3000);
    } catch { 
      setErr("Failed to change password. Please check your old password."); 
      setTimeout(() => setErr(""), 3000);
    }
    setPasswordLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
              <FaStore className="text-white text-2xl" />
            </div>
            Vendor Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your store and business settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Store Information</h2>
                {!edit && (
                  <button 
                    onClick={() => { 
                      setEdit(true); 
                      setName(profile.name); 
                      setEmail(profile.email); 
                      setProfilePicUrl(profile.profile_pic_url || ""); 
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaEdit className="text-sm" />
                    Edit Profile
                  </button>
                )}
              </div>

        {edit ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePicChange} className="hidden" />
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-500 to-red-600 p-1">
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                            <div className="text-gray-400 text-4xl font-bold">
                              {profile.name ? profile.name.charAt(0).toUpperCase() : 'V'}
                            </div>
                )}
              </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-2xl" />
                      </div>
                    </div>
                    {uploading && (
                      <div className="mt-2 flex items-center gap-2 text-orange-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">Click to change store logo</p>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Name</label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Enter your store name" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Email</label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="Enter your business email" 
                        type="email"
                        required 
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button 
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50" 
                      type="submit" 
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="text-sm" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200" 
                      type="button" 
                      onClick={() => setEdit(false)}
                    >
                      <FaTimes className="text-sm" />
                      Cancel
                    </button>
            </div>
          </form>
        ) : (
                <div className="space-y-6">
                  {/* Profile Display */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-500 to-red-600 p-1 mb-4">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profile.profile_pic_url ? (
                  <img src={profile.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                          <div className="text-gray-400 text-4xl font-bold">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'V'}
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{profile.name || 'Vendor Store'}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full">
                      <FaStore className="text-orange-500 text-sm" />
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Verified Vendor</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Change Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                  <FaLock className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Change Password</h3>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                    <div className="relative">
                      <input 
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200" 
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword} 
                        onChange={e => setOldPassword(e.target.value)} 
                        placeholder="Enter current password" 
                        required 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <input 
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200" 
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword} 
                        onChange={handleNewPasswordChange} 
                        placeholder="Enter new password" 
                        required 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    
                    {/* Password requirements */}
                    {newPassword && mounted && (
                      <div className="text-xs space-y-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-2">
                        <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</div>
                        <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          At least 8 characters
                        </div>
                        <div className={`flex items-center gap-2 ${passwordValidation.capital ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordValidation.capital ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          One capital letter (A-Z)
                        </div>
                        <div className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordValidation.special ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          One special character (!@#$%^&*)
                        </div>
                        <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordValidation.number ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          One number (0-9)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 ${
                    newPassword && mounted && !validatePassword(newPassword) 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700'
                  }`}
                  type="submit" 
                  disabled={passwordLoading || (newPassword && mounted && !validatePassword(newPassword))}
                >
                  {passwordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <FaLock className="text-sm" />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Business Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Business Overview</h3>
              {statsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                        <div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FaBox className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.products}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <FaChartLine className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sales</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.sales}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500 rounded-lg">
                        <FaStar className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.rating} ⭐</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 rounded-lg">
                        <FaDollarSign className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Earnings</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">${stats.earnings}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <FaTrophy className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{stats.memberSince}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/vendor/products" className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <FaBox className="text-white text-sm" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Manage Products</span>
                </Link>
                <Link href="/vendor/analytics" className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <FaChartLine className="text-white text-sm" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">View Analytics</span>
                </Link>
                <Link href="/vendor/payments" className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <FaDollarSign className="text-white text-sm" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Payment History</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {msg && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
            {msg}
          </div>
        )}
        {err && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
            {err}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 
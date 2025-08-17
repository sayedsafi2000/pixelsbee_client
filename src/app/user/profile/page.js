"use client";
import { useEffect, useState, useRef } from "react";
import { FaUser, FaCamera, FaEdit, FaSave, FaTimes, FaLock, FaEye, FaEyeSlash, FaDownload, FaHeart, FaCrown, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../../../components/AuthProvider";
import { userAPI } from "../../../utils/api";

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", profile_pic_url: "" });
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
  const [stats, setStats] = useState({ downloads: 0, favorites: 0, memberSince: "" });
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
    async function fetchProfile() {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setProfilePicUrl(data.profile_pic_url || "");
      }
    }
    
    async function fetchStats() {
      try {
        setStatsLoading(true);
        const statsData = await userAPI.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        setStats({ downloads: 0, favorites: 0, memberSince: "Unknown" });
      } finally {
        setStatsLoading(false);
      }
    }
    
    fetchProfile();
    fetchStats();
  }, []);
  
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
      const token = localStorage.getItem('authToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, profile_pic_url: profilePicUrl })
      });
      setMsg("Profile updated successfully! ✨"); 
      setEdit(false);
      setProfile({ ...profile, name, email, profile_pic_url: profilePicUrl });
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
    if (newPassword && !validatePassword(newPassword)) {
      setErr("Please ensure your new password meets all requirements");
      return;
    }
    
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'}/api/user/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword })
      });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <FaUser className="text-white text-2xl" />
            </div>
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Information</h2>
                {!edit && (
                  <button 
                    onClick={() => { 
                      setEdit(true); 
                      setName(profile.name); 
                      setEmail(profile.email); 
                      setProfilePicUrl(profile.profile_pic_url || ""); 
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                            <div className="text-gray-400 text-4xl font-bold">
                              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                )}
              </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-2xl" />
                      </div>
                    </div>
                    {uploading && (
                      <div className="mt-2 flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">Click to change profile picture</p>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Enter your full name" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <input 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="Enter your email" 
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
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1 mb-4">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profile.profile_pic_url ? (
                  <img src={profile.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                          <div className="text-gray-400 text-4xl font-bold">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{profile.name || 'User'}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full">
                      <FaCrown className="text-yellow-500 text-sm" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Premium User</span>
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
            {/* User Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Activity</h3>
              {statsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
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
                        <FaDownload className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Downloads</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.downloads}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500 rounded-lg">
                        <FaHeart className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.favorites}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <FaCrown className="text-white text-sm" />
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
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <FaDownload className="text-white text-sm" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">View Downloads</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <FaHeart className="text-white text-sm" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">My Favorites</span>
                </button>
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
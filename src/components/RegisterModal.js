"use client";
import React, { useState, useEffect } from "react";
import { authAPI } from "../utils/api";
import { useRef } from "react";

export default function RegisterModal({ open, onClose, onLogin, switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef();

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

  if (!open) return null;

  // Password validation function (pure)
  const validatePassword = (pwd) => {
    const validation = {
      length: pwd.length >= 8,
      capital: /[A-Z]/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      number: /[0-9]/.test(pwd)
    };
    return validation;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (mounted) {
      setPasswordValidation(validatePassword(newPassword));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password before submission (pure check)
    const currentValidation = validatePassword(password);
    const isValid = currentValidation.length && currentValidation.capital && currentValidation.special && currentValidation.number;
    if (!isValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    try {
      const res = await authAPI.register({ name, email, password, role, profile_pic_url: profilePicUrl });
      
      if (res.token && res.user) {
        // Auto-login for first admin user or successful registration
        localStorage.setItem("authToken", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        
        // Call onLogin callback if provided
        if (onLogin) {
          onLogin(res.user);
        }
        
        setSuccess(res.message || "Registration successful! Welcome to Pixelsbee! 🎉");
        
        // Clear form
        setName(""); setEmail(""); setPassword(""); setRole("user");
        setProfilePicUrl("");
        setPasswordValidation({ length: false, capital: false, special: false, number: false });
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else if (res.message && res.user) {
        // Regular registration - needs admin approval
        setSuccess(res.message);
        setName(""); setEmail(""); setPassword(""); setRole("user");
        setProfilePicUrl("");
        setPasswordValidation({ length: false, capital: false, special: false, number: false });
        
        // Close modal after a longer delay for pending approval message
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  const isPasswordValid = passwordValidation.length && passwordValidation.capital && passwordValidation.special && passwordValidation.number;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Sign up for Pixelsbee</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePicChange} className="hidden" />
            <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => fileInputRef.current.click()}>
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-neutral-400">Add Photo</span>
              )}
            </div>
            {uploading && <span className="text-xs text-neutral-500">Uploading...</span>}
          </div>
          <input type="text" placeholder="Username" className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none" required value={name} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="Email" className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none" required value={email} onChange={e => setEmail(e.target.value)} />
          
          {/* Password input with validation */}
          <div className="space-y-2">
            <input 
              type="password" 
              placeholder="Password" 
              className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none w-full" 
              required 
              value={password} 
              onChange={handlePasswordChange} 
            />
            
            {/* Password requirements */}
            {password && mounted && (
              <div className="text-xs space-y-1 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">Password Requirements:</div>
                <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-600' : 'text-neutral-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-neutral-300'}`}></span>
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.capital ? 'text-green-600' : 'text-neutral-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${passwordValidation.capital ? 'bg-green-500' : 'bg-neutral-300'}`}></span>
                  One capital letter (A-Z)
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-600' : 'text-neutral-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${passwordValidation.special ? 'bg-green-500' : 'bg-neutral-300'}`}></span>
                  One special character (!@#$%^&*)
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-600' : 'text-neutral-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${passwordValidation.number ? 'bg-green-500' : 'bg-neutral-300'}`}></span>
                  One number (0-9)
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={(e) => setRole(e.target.value)}
                className="text-red-600"
              />
              <span className="text-sm">User</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="vendor"
                checked={role === "vendor"}
                onChange={(e) => setRole(e.target.value)}
                className="text-red-600"
              />
              <span className="text-sm">Vendor</span>
            </label>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          <button 
            type="submit" 
            className={`rounded-full py-2 font-semibold transition ${
              password && mounted && !isPasswordValid 
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            disabled={password && mounted && !isPasswordValid}
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account? <span className="text-red-600 cursor-pointer font-semibold" onClick={switchToLogin}>Log in</span>
        </div>
      </div>
    </div>
  );
} 
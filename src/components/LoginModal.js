"use client";
import React, { useState } from "react";
import { authAPI } from "../utils/api";

export default function LoginModal({ open, onClose, switchToRegister, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  if (!open) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await authAPI.login({ email, password });
      if (res.token) {
        localStorage.setItem("authToken", res.token);
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
        // Call onLogin callback instead of reloading
        if (onLogin) {
          onLogin(res.user);
        }
        onClose();
        // Reset form
        setEmail("");
        setPassword("");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  
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
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Log in to Pixelsbee</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>}
          <button 
            type="submit" 
            className={`bg-red-600 text-white rounded-full py-2 font-semibold transition ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Don&apos;t have an account? <span className="text-red-600 cursor-pointer font-semibold hover:underline" onClick={switchToRegister}>Sign up</span>
        </div>
      </div>
    </div>
  );
} 
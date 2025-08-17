"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, userAPI } from '@/utils/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    if (!mounted) return; // Only run after component is mounted

    const checkAuth = async () => {
      try {
        // Only access localStorage after component is mounted (client-side)
        if (typeof window !== 'undefined') {
          const currentUser = authAPI.getCurrentUser();
          const token = localStorage.getItem('authToken');
          
          if (currentUser && token) {
            // Verify token and get user data
            try {
              const response = await userAPI.getProfile();
              setUser(response);
            } catch (error) {
              // Token is invalid, remove it
              authAPI.logout();
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [mounted]);

  // Handlers to open/close modals
  const openLogin = () => setLoginOpen(true);
  const closeLogin = () => setLoginOpen(false);
  const openRegister = () => setRegisterOpen(true);
  const closeRegister = () => setRegisterOpen(false);

  // Switch between modals
  const switchToRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };
  const switchToLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  // Handle successful login
  const handleLogin = (userData) => {
    setUser(userData);
    setLoginOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    if (mounted) {
      authAPI.logout();
    }
    setUser(null);
    window.location.href = '/';
  };

  // Login function using API service
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.token && response.user) {
        setUser(response.user);
        setLoginOpen(false);
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Register function using API service
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // For vendors, they need admin approval
      if (userData.role === 'vendor') {
        return { success: true, message: 'Registration successful, pending admin approval' };
      }
      
      // For regular users, auto-login
      if (response.token && response.user) {
        setUser(response.user);
        setRegisterOpen(false);
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await userAPI.updateProfile(profileData);
      
      // Update local state
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is vendor
  const isVendor = () => hasRole('vendor');

  // Check if user is regular user
  const isUser = () => hasRole('user');

  const authValue = {
    user,
    login: openLogin,
    register: openRegister,
    logout: handleLogout,
    isAuthenticated: !!user,
    loginOpen,
    registerOpen,
    closeLogin,
    closeRegister,
    switchToRegister,
    switchToLogin,
    handleLogin,
    mounted, // Expose mounted state for components that need it
    
    // API-based functions
    loginUser: login,
    registerUser: register,
    updateUserProfile: updateProfile,
    hasRole,
    isAdmin,
    isVendor,
    isUser,
  };

  // Don't show loading state during SSR to prevent hydration mismatch
  // Only show loading state after component is mounted and still loading
  if (mounted && loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
} 
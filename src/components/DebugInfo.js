'use client';

import { useState, useEffect } from 'react';

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState({
    isClient: false,
    localStorage: 'Not available',
    userAgent: 'Not available',
    windowSize: 'Not available',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'
  });

  useEffect(() => {
    setDebugInfo({
      isClient: true,
      localStorage: typeof window !== 'undefined' ? 'Available' : 'Not available',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Not available',
      windowSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Not available',
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://pixelsbee-server.onrender.com'
    });
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show debug info in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Client:</strong> {debugInfo.isClient ? 'Yes' : 'No'}</div>
        <div><strong>localStorage:</strong> {debugInfo.localStorage}</div>
        <div><strong>API URL:</strong> {debugInfo.apiUrl}</div>
        <div><strong>Window:</strong> {debugInfo.windowSize}</div>
        <div className="text-xs opacity-75 mt-2">
          Only visible in development
        </div>
      </div>
    </div>
  );
}

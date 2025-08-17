'use client';

import { useEffect, useState } from 'react';

export default function NoSSR({ children, fallback = null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR and initial render, show fallback or null
  if (!isMounted) {
    return fallback;
  }

  // After hydration, render children
  return children;
}

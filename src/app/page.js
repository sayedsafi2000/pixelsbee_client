"use client";

import Header from "../components/Header";
import PinterestGrid from "../components/PinterestGrid";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthProvider";

export default function Home() {
  const { user, login } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col">
      <Header
        onLogin={login}
        onRegister={login}
        user={user}
      />
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8">
        <PinterestGrid onLogin={login} />
      </main>
      <Footer />
    </div>
  );
}

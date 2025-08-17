"use client";

export default function Footer() {
  return (
    <footer className="w-full py-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Business</a>
        <a href="#" className="hover:underline">Blog</a>
        <a href="#" className="hover:underline">Careers</a>
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Terms</a>
        <a href="#" className="hover:underline">Help</a>
        <span className="hidden sm:inline">© {new Date().getFullYear()} Pinterest Clone</span>
      </div>
    </footer>
  );
} 
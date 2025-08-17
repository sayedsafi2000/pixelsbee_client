"use client";
import { useState } from "react";

export default function CreatePage() {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-purple-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 flex flex-col items-center p-4">
      <div className="w-full max-w-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/40 dark:border-neutral-800/40 mt-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-neutral-800 dark:text-neutral-100">Create Pin</h1>
        <form className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-contain rounded-2xl shadow mb-2" />
            ) : (
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                <span className="text-neutral-500 dark:text-neutral-400 mb-2">Click to upload image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <input type="text" placeholder="Title" className="px-4 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 focus:outline-none shadow" />
          <textarea placeholder="Description" className="px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 focus:outline-none shadow resize-none min-h-[80px]" />
          <select className="px-4 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 focus:outline-none shadow">
            <option value="">Select Category</option>
            <option>Nature</option>
            <option>Work</option>
            <option>Travel</option>
            <option>Home</option>
            <option>Fashion</option>
            <option>Food</option>
            <option>Adventure</option>
          </select>
          <button type="button" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-full font-bold shadow-lg transition">Create Pin</button>
        </form>
      </div>
    </div>
  );
} 
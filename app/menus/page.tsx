"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DUMMY_RESTAURANTS } from "@/lib/dummy-data";

const STORAGE_KEY = "sutherland-order-tracker";

export default function MenusPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.lang) setLang(data.lang);
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const data = saved ? JSON.parse(saved) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lang }));
    }
  }, [lang, isLoaded]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="bg-[#27235C] py-4 relative print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between min-h-[48px]">
          <div className="flex items-center gap-3" dir="ltr">
            <img src="/logo.png" alt="SutherBites Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-semibold text-white tracking-tight hidden sm:block">
              SutherBites
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-[#1e1b47] p-1 rounded-lg" dir={lang === "ar" ? "rtl" : "ltr"}>
            <Link href="/" className="px-4 py-2 text-white/70 hover:text-white rounded-md text-sm font-medium transition-colors whitespace-nowrap">
              {lang === 'ar' ? 'الطلب' : 'Order'}
            </Link>
            <Link href="/menus" className="px-4 py-2 bg-white text-[#27235C] rounded-md text-sm font-medium transition-colors whitespace-nowrap">
              {lang === 'ar' ? 'القوائم' : 'Menus'}
            </Link>
          </div>

          <div className="flex gap-2" dir="ltr">
            <button 
              onClick={() => setLang('en')} 
              className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${lang === 'en' ? 'bg-white text-[#27235C] border-white' : 'text-white/70 border-white/20 hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('ar')} 
              className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${lang === 'ar' ? 'bg-white text-[#27235C] border-white' : 'text-white/70 border-white/20 hover:text-white'}`}
            >
              AR
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#27235C] mb-8">
          {lang === 'ar' ? 'المطاعم المتاحة' : 'Available Restaurants'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DUMMY_RESTAURANTS.map((restaurant) => (
            <Link href={`/menus/${restaurant.id}`} key={restaurant.id}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#E9ECEF] h-full flex flex-row items-center p-4 gap-4">
                <img 
                  src={restaurant.logo} 
                  alt={restaurant.name} 
                  className="w-24 h-24 rounded-lg object-cover bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#212529] truncate">{restaurant.name}</h3>
                  <p className="text-sm text-[#6C757D] mt-1 line-clamp-2">{restaurant.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DUMMY_RESTAURANTS } from "@/lib/dummy-data";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "sutherland-order-tracker";

export default function RestaurantMenuPage() {
  const params = useParams();
  const id = params?.id as string;
  const restaurant = DUMMY_RESTAURANTS.find(r => r.id === id);

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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[#27235C]">Restaurant Not Found</h1>
        <Link href="/menus" className="mt-4 text-[#DE1B54] font-medium hover:underline">
          Back to Menus
        </Link>
      </div>
    );
  }

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
        <Link 
          href="/menus" 
          className="inline-flex items-center text-[#6C757D] hover:text-[#27235C] transition-colors mb-6 font-medium text-sm"
        >
          {lang === "ar" ? <ChevronRight className="w-4 h-4 rtl:ml-1 ltr:mr-1" /> : <ChevronLeft className="w-4 h-4 rtl:ml-1 ltr:mr-1" />}
          {lang === 'ar' ? 'العودة للقوائم' : 'Back to Menus'}
        </Link>

        {/* Restaurant Header */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#E9ECEF] mb-8 flex flex-col sm:flex-row items-center sm:items-stretch">
          <img 
            src={restaurant.logo} 
            alt={restaurant.name} 
            className="w-full sm:w-48 h-48 sm:h-auto object-cover bg-gray-100"
          />
          <div className="p-6 flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-[#27235C]">{restaurant.name}</h2>
            <p className="text-[#6C757D] mt-2">{restaurant.description}</p>
          </div>
        </div>

        {/* Menu Items */}
        <h3 className="text-xl font-bold text-[#212529] mb-6 border-b border-[#E9ECEF] pb-2">
          {lang === 'ar' ? 'القائمة' : 'Menu'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurant.menu.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-[#E9ECEF] shadow-sm flex flex-col justify-between hover:border-[#27235C]/30 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h4 className="text-lg font-semibold text-[#212529]">{item.name}</h4>
                  <span className="font-bold text-[#DE1B54] whitespace-nowrap">EGP {item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-[#6C757D]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

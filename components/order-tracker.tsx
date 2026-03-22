"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Store,
  Plus,
  Truck,
  Users,
  ClipboardList,
  Printer,
  RotateCcw,
  Trash2,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY = "sutherland-order-tracker";

type Locale = "en" | "ar";

const translations = {
  en: {
    restaurant: "Restaurant",
    restaurantPlaceholder: "Enter restaurant name",
    addNewOrder: "Add New Order",
    nameLabel: "Name",
    namePlaceholder: "Enter name",
    itemLabel: "Item",
    itemPlaceholder: "e.g., Rob3 far5a",
    priceLabel: "Price (EGP)",
    addOrderBtn: "Add Order",
    deliveryFee: "Delivery Fee",
    deliveryPlaceholder: "Total delivery fee (will be split equally)",
    feePerPerson: "Fee per person",
    participant: "participant",
    participants: "participants",
    members: "Members",
    noOrders: "No orders yet. Add your first order above.",
    tableName: "Name",
    tableItem: "Item",
    tablePrice: "Price",
    tableFee: "Fee",
    tableTotal: "Total",
    tablePaid: "Paid",
    change: "Change",
    owes: "Owes",
    paidBadge: "PAID",
    orderSummary: "Order Summary",
    itemsToOrder: "Items to Order:",
    subtotal: "Subtotal",
    delivery: "Delivery Fee",
    grandTotal: "Grand Total",
    printBtn: "Print Receipt",
    copyBtn: "Copy Receipt",
    clearAll: "Clear All",
    clearTitle: "Clear All Orders?",
    clearDesc: "This will remove all orders and reset the delivery fee. This action cannot be undone.",
    cancel: "Cancel",
    yesClear: "Yes, Clear All",
    receiptTitle: "SUTHERBITES ORDER SUMMARY",
    receiptDate: "Date",
    receiptOrders: "ORDERS",
    receiptFee: "Fee",
    receiptFor: "FOR RESTAURANT",
    receiptReturn: "Change to return",
    receiptStillOwes: "Still owes",
    thankYou: "Thank you!",
    madeBy: "Made by Omar",
  },
  ar: {
    restaurant: "المطعم",
    restaurantPlaceholder: "أدخل اسم المطعم",
    addNewOrder: "إضافة طلب جديد",
    nameLabel: "الاسم",
    namePlaceholder: "أدخل الاسم",
    itemLabel: "الطلب",
    itemPlaceholder: "مثال: ربع فرخة",
    priceLabel: "السعر (جنية)",
    addOrderBtn: "إضافة طلب",
    deliveryFee: "رسوم التوصيل",
    deliveryPlaceholder: "إجمالي رسوم التوصيل (ستقسم بالتساوي)",
    feePerPerson: "الرسوم لكل شخص",
    participant: "مشارك",
    participants: "مشاركين",
    members: "الأعضاء",
    noOrders: "لا توجد طلبات بعد. أضف طلبك الأول بالأعلى.",
    tableName: "الاسم",
    tableItem: "الطلب",
    tablePrice: "السعر",
    tableFee: "الرسوم",
    tableTotal: "الإجمالي",
    tablePaid: "تحديد الدفع",
    change: "الباقي",
    owes: "متبقي",
    paidBadge: "مدفوع",
    orderSummary: "ملخص الطلب",
    itemsToOrder: "الطلبات ليتم طلبها:",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    grandTotal: "الإجمالي",
    printBtn: "طباعة الفاتورة",
    copyBtn: "نسخ الفاتورة",
    clearAll: "مسح الكل",
    clearTitle: "مسح كل الطلبات؟",
    clearDesc: "هذا سيقوم بإزالة جميع الطلبات وتصفير رسوم التوصيل. لا يمكن التراجع عن هذا الإجراء.",
    cancel: "إلغاء",
    yesClear: "نعم، امسح الكل",
    receiptTitle: "ملخص طلبات سذربايتس",
    receiptDate: "التاريخ",
    receiptOrders: "الطلبات",
    receiptFee: "الرسوم",
    receiptFor: "للمطعم",
    receiptReturn: "المتبقي لصالحه",
    receiptStillOwes: "المتبقي عليه",
    thankYou: "شكراً لك!",
    madeBy: "صنع بواسطة عمر",
  }
};

interface OrderEntry {
  id: string;
  name: string;
  item: string;
  price: number;
  paid: boolean;
  customFee?: number;
  amountPaid?: number;
}

interface OrderData {
  entries: OrderEntry[];
  deliveryFee: number;
  restaurantName: string;
  lang?: Locale;
}

const formatEGP = (amount: number): string => {
  return `EGP ${amount.toFixed(2)}`;
};

export default function OrderTracker() {
  const [lang, setLang] = useState<Locale>("en");
  const [entries, setEntries] = useState<OrderEntry[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [restaurantName, setRestaurantName] = useState("");
  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: OrderData = JSON.parse(saved);
        setEntries(data.entries || []);
        setDeliveryFee(data.deliveryFee || 0);
        setRestaurantName(data.restaurantName || "");
        if (data.lang) setLang(data.lang);
      } catch {
        console.error("Failed to load saved data");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ entries, deliveryFee, restaurantName, lang })
      );
    }
  }, [entries, deliveryFee, restaurantName, lang, isLoaded]);

  const feeShare = useMemo(() => {
    const entriesWithoutCustomFee = entries.filter((e) => e.customFee === undefined);
    const totalCustomFee = entries.reduce((sum, e) => sum + (e.customFee || 0), 0);
    const remainingFee = Math.max(0, deliveryFee - totalCustomFee);
    return entriesWithoutCustomFee.length > 0 ? remainingFee / entriesWithoutCustomFee.length : 0;
  }, [entries, deliveryFee]);

  const subtotal = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.price, 0);
  }, [entries]);

  const grandTotal = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, { name: string; count: number }> = {};
    entries.forEach((entry) => {
      const key = entry.item.toLowerCase().trim();
      if (groups[key]) {
        groups[key].count += 1;
      } else {
        groups[key] = { name: entry.item, count: 1 };
      }
    });
    return groups;
  }, [entries]);

  const addEntry = useCallback(() => {
    if (!name.trim() || !item.trim() || !price.trim()) return;

    const newEntry: OrderEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      item: item.trim(),
      price: parseFloat(price) || 0,
      paid: false,
    };

    setEntries((prev) => [...prev, newEntry]);
    setName("");
    setItem("");
    setPrice("");
  }, [name, item, price]);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<OrderEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    setDeliveryFee(0);
    setRestaurantName("");
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const generateReceiptText = useCallback(() => {
    const tr = translations[lang];
    let text = `${tr.receiptTitle}\n`;
    text += `${tr.receiptDate}: ${new Date().toLocaleDateString("en-GB")}\n\n`;
    text += `${tr.receiptOrders}:\n`;
    entries.forEach((entry, index) => {
      text += `${index + 1}. ${entry.name}\n`;
      text += `   ${entry.item} - ${formatEGP(entry.price)}\n`;
      const fee = entry.customFee !== undefined ? entry.customFee : feeShare;
      text += `   + ${tr.receiptFee}: ${formatEGP(fee)}\n`;
      const total = entry.price + fee;
      let paidStr = entry.paid ? ` [${tr.paidBadge}: ${formatEGP(entry.amountPaid || 0)}]` : "";
      text += `   = ${formatEGP(total)}${paidStr}\n`;
      
      const diff = (entry.amountPaid || 0) - total;
      if (entry.paid && Math.abs(diff) >= 0.01) {
        text += diff > 0 
          ? `   (${tr.receiptReturn}: ${formatEGP(diff)})\n`
          : `   (${tr.receiptStillOwes}: ${formatEGP(Math.abs(diff))})\n`;
      }
      text += "\n";
    });

    text += `${tr.receiptFor}:\n`;
    Object.values(groupedItems).forEach((groupedItem) => {
      text += `${groupedItem.count}x ${groupedItem.name}\n`;
    });

    text += "\n";
    text += `${tr.subtotal}: ${formatEGP(subtotal)}\n`;
    text += `${tr.delivery}: ${formatEGP(deliveryFee)}\n`;
    text += `${tr.grandTotal}: ${formatEGP(grandTotal)}\n`;

    return text;
  }, [entries, feeShare, groupedItems, subtotal, deliveryFee, grandTotal, lang]);

  const handleCopyText = useCallback(() => {
    const text = generateReceiptText();
    navigator.clipboard.writeText(text).then(() => {
      alert("Receipt text copied to clipboard!");
    });
  }, [generateReceiptText]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-[#27235C] text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="no-print min-h-screen bg-[#F8F9FA]" dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <header className="bg-[#27235C] py-6 relative">
          <div className="max-w-4xl mx-auto px-4 relative flex items-center justify-center min-h-[48px]">
            {/* Language Toggles */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2" dir="ltr">
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

            <div className="flex items-center justify-center gap-3" dir="ltr">
              <img src="/logo.png" alt="SutherBites Logo" className="w-12 h-12 object-contain" />
              <h1 className="text-2xl font-semibold text-white text-center tracking-tight">
                SutherBites
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
          {/* Restaurant Section */}
          <section className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27235C] flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#212529]">{t.restaurant}</h2>
            </div>
            <Input
              type="text"
              placeholder={t.restaurantPlaceholder}
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="h-12 text-base bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]"
            />
          </section>

          {/* Add Order Section */}
          <section className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27235C] flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#212529]">{t.addNewOrder}</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#6C757D]">{t.nameLabel}</label>
                  <Input
                    placeholder={t.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#6C757D]">{t.itemLabel}</label>
                  <Input
                    placeholder={t.itemPlaceholder}
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#6C757D]">{t.priceLabel}</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]"
                  />
                </div>
              </div>
              <Button
                onClick={addEntry}
                disabled={!name.trim() || !item.trim() || !price.trim()}
                className="h-12 bg-[#DE1B54] hover:bg-[#c01848] text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                {t.addOrderBtn}
              </Button>
            </div>
          </section>

          {/* Delivery Fee Section */}
          <section className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27235C] flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#212529]">{t.deliveryFee}</h2>
            </div>
            <Input
              type="number"
              placeholder={t.deliveryPlaceholder}
              value={deliveryFee || ""}
              onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
              className="h-12 text-base bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]"
            />
            {entries.length > 0 && deliveryFee > 0 && (
              <div className="mt-4 p-4 bg-[#F8F9FA] rounded-lg flex items-center justify-between">
                <span className="text-sm text-[#6C757D]">
                  {t.feePerPerson} ({entries.length} {entries.length !== 1 ? t.participants : t.participant})
                </span>
                <span className="font-semibold text-[#DE1B54]">{formatEGP(feeShare)}</span>
              </div>
            )}
          </section>

          {/* Members Table Section */}
          <section className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27235C] flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#212529]">
                {t.members}
                {entries.length > 0 && (
                  <span className="mx-2 text-sm font-normal text-[#6C757D]">
                    ({entries.length})
                  </span>
                )}
              </h2>
            </div>

            {entries.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#E9ECEF] flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#6C757D]" />
                </div>
                <p className="text-[#6C757D]">{t.noOrders}</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#E9ECEF]">
                      <th className="text-start py-3 px-4 text-sm font-semibold text-[#27235C]">{t.tableName}</th>
                      <th className="text-start py-3 px-4 text-sm font-semibold text-[#27235C]">{t.tableItem}</th>
                      <th className="text-end py-3 px-4 text-sm font-semibold text-[#27235C]">{t.tablePrice}</th>
                      <th className="text-end py-3 px-4 text-sm font-semibold text-[#27235C]">{t.tableFee}</th>
                      <th className="text-end py-3 px-4 text-sm font-semibold text-[#27235C]">{t.tableTotal}</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-[#27235C]">{t.tablePaid}</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`border-b border-[#E9ECEF] last:border-0 transition-colors ${
                          entry.paid ? "bg-emerald-50" : ""
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {entry.paid && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <span className="font-medium text-[#212529]">{entry.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#6C757D]">{entry.item}</td>
                        <td className="py-4 px-4 text-end text-[#212529]">
                          <Input
                            type="number"
                            value={entry.price || ""}
                            onChange={(e) => updateEntry(entry.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-24 ltr:ml-auto rtl:mr-auto h-8 text-end bg-transparent border-0 hover:bg-white/50 focus:bg-white focus-visible:ring-1 focus-visible:ring-[#27235C]"
                          />
                        </td>
                        <td className="py-4 px-4 text-end text-[#DE1B54] font-medium">
                          <Input
                            type="number"
                            placeholder={feeShare.toFixed(2)}
                            value={entry.customFee !== undefined ? entry.customFee : ""}
                            onChange={(e) => updateEntry(entry.id, { customFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                            className="w-24 ltr:ml-auto rtl:mr-auto h-8 text-end text-[#DE1B54] font-medium bg-transparent border-0 hover:bg-white/50 focus:bg-white focus-visible:ring-1 focus-visible:ring-[#27235C]"
                          />
                        </td>
                        <td className="py-4 px-4 text-end font-semibold text-[#27235C]">
                          {formatEGP(entry.price + (entry.customFee !== undefined ? entry.customFee : feeShare))}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center gap-2">
                            <Switch
                              dir={lang === "ar" ? "rtl" : "ltr"}
                              checked={entry.paid}
                              onCheckedChange={(checked) => {
                                const totalOwed = entry.price + (entry.customFee !== undefined ? entry.customFee : feeShare);
                                updateEntry(entry.id, { paid: checked, amountPaid: checked ? totalOwed : undefined });
                              }}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                            {entry.paid && (
                              <div className="flex flex-col items-center select-none">
                                <Input
                                  type="number"
                                  value={entry.amountPaid || ""}
                                  onChange={(e) => updateEntry(entry.id, { amountPaid: parseFloat(e.target.value) || 0 })}
                                  className="w-20 h-7 px-1 text-xs text-center border-[#E9ECEF] focus-visible:ring-emerald-500"
                                  placeholder={t.tablePaid}
                                />
                                {(() => {
                                  const totalOwed = entry.price + (entry.customFee !== undefined ? entry.customFee : feeShare);
                                  const paid = entry.amountPaid || 0;
                                  const diff = paid - totalOwed;
                                  if (Math.abs(diff) < 0.01) return null;
                                  if (diff > 0) return <span className="text-[10px] text-emerald-600 mt-1 font-medium whitespace-nowrap">{t.change}: {formatEGP(diff)}</span>;
                                  return <span className="text-[10px] text-red-500 mt-1 font-medium whitespace-nowrap">{t.owes}: {formatEGP(Math.abs(diff))}</span>;
                                })()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(entry.id)}
                            className="h-8 w-8 p-0 text-[#6C757D] hover:text-[#DE1B54] hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Order Summary Section */}
          {entries.length > 0 && (
            <section className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#DE1B54] flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-[#212529]">{t.orderSummary}</h2>
              </div>

              <div className="bg-[#F8F9FA] rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-[#27235C] mb-3">{t.itemsToOrder}</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(groupedItems).map((groupedItem, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#27235C] text-white text-xs font-semibold flex items-center justify-center">
                        {groupedItem.count}
                      </span>
                      <span className="text-[#212529]">{groupedItem.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-[#E9ECEF]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C757D]">{t.subtotal}</span>
                  <span className="text-[#212529]">{formatEGP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C757D]">{t.delivery}</span>
                  <span className="text-[#DE1B54]">{formatEGP(deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#E9ECEF]">
                  <span className="font-semibold text-[#212529]">{t.grandTotal}</span>
                  <span className="font-bold text-xl text-[#27235C]">{formatEGP(grandTotal)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6 flex-wrap">
            <Button
              onClick={handlePrint}
              disabled={entries.length === 0}
              className="h-12 px-6 bg-[#27235C] hover:bg-[#1e1b47] text-white font-medium rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
              {t.printBtn}
            </Button>

            <Button
              onClick={handleCopyText}
              disabled={entries.length === 0}
              className="h-12 px-6 bg-[#DE1B54] hover:bg-[#c01848] text-white font-medium rounded-lg transition-colors"
            >
              <Copy className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
              {t.copyBtn}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={entries.length === 0}
                  className="h-12 px-6 border-[#E9ECEF] text-[#6C757D] hover:border-[#DE1B54] hover:text-[#DE1B54] hover:bg-red-50 font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                  {t.clearAll}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#212529]">{t.clearTitle}</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#6C757D]">
                    {t.clearDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAll}
                    className="bg-[#DE1B54] hover:bg-[#c01848] text-white rounded-lg"
                  >
                    {t.yesClear}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>

        <footer className="py-4 text-center text-sm text-[#6C757D]">
          {t.madeBy}
        </footer>
      </div>

      {/* Print Receipt */}
      <div className="print-receipt hidden print:block" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="text-center mb-4">
          <div className="text-lg font-bold tracking-wider">
            ================================
          </div>
          <div className="text-xl font-bold my-2">SUTHERBITES</div>
          {restaurantName && (
            <div className="text-sm font-bold mt-1">{restaurantName}</div>
          )}
          <div className="text-lg font-bold tracking-wider">
            ================================
          </div>
        </div>

        <div className="my-4">
          <div className="text-xs mb-2">
            {t.receiptDate}: {new Date().toLocaleDateString("en-GB")}
          </div>
          <div className="border-b border-dashed border-black my-2" />
        </div>

        <div className="mb-4">
          <div className="font-bold mb-2">{t.receiptOrders}:</div>
          {entries.map((entry, index) => (
            <div key={entry.id} className="mb-2">
              <div>
                {index + 1}. {entry.name}
              </div>
              <div className="px-4">
                {entry.item} - {formatEGP(entry.price)}
              </div>
              <div className="px-4">
                + {t.receiptFee}: {formatEGP(entry.customFee !== undefined ? entry.customFee : feeShare)}
              </div>
              <div className="px-4 font-bold">
                = {formatEGP(entry.price + (entry.customFee !== undefined ? entry.customFee : feeShare))}
                {entry.paid ? ` [${t.paidBadge}: ${formatEGP(entry.amountPaid || 0)}]` : ""}
              </div>
              {(() => {
                const totalOwed = entry.price + (entry.customFee !== undefined ? entry.customFee : feeShare);
                const diff = (entry.amountPaid || 0) - totalOwed;
                if (!entry.paid || Math.abs(diff) < 0.01) return null;
                return (
                  <div className="px-4 text-xs italic">
                    {diff > 0 ? `${t.receiptReturn}: ${formatEGP(diff)}` : `${t.receiptStillOwes}: ${formatEGP(Math.abs(diff))}`}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-black my-2" />

        <div className="mb-4">
          <div className="font-bold mb-2">{t.receiptFor}:</div>
          {Object.values(groupedItems).map((groupedItem, index) => (
            <div key={index}>
              {groupedItem.count}x {groupedItem.name}
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-black my-2" />

        <div className="mt-4">
          <div className="flex justify-between">
            <span>{t.subtotal}:</span>
            <span>{formatEGP(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.delivery}:</span>
            <span>{formatEGP(deliveryFee)}</span>
          </div>
          <div className="border-b border-dashed border-black my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>{t.grandTotal}:</span>
            <span>{formatEGP(grandTotal)}</span>
          </div>
        </div>

        <div className="text-center mt-6 text-xs">
          <div>--------------------------------</div>
          <div>{t.thankYou}</div>
          <div>{t.madeBy}</div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Pencil,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface OrderEntry {
  id: string;
  name: string;
  item: string;
  price: number;
  paid: boolean;
  paidAmount: number;
}

interface OrderData {
  entries: OrderEntry[];
  deliveryFee: number;
  restaurantName: string;
}

const formatEGP = (amount: number): string => {
  return `EGP ${amount.toFixed(2)}`;
};

export default function OrderTracker() {
  const [entries, setEntries] = useState<OrderEntry[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [restaurantName, setRestaurantName] = useState("");
  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [itemCount, setItemCount] = useState(1);
  const [items, setItems] = useState([{ item: "", price: "" }]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingItem, setEditingItem] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [showCollection, setShowCollection] = useState(false);
  const [paymentsByPerson, setPaymentsByPerson] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: OrderData = JSON.parse(saved);
        setEntries((data.entries || []).map((entry) => ({
          ...entry,
          paidAmount: typeof entry.paidAmount === "number" ? entry.paidAmount : entry.paid ? entry.price : 0,
        })));
  setDeliveryFee(data.deliveryFee || 0);
  setRestaurantName(data.restaurantName || "");
  setPaymentsByPerson(data.paymentsByPerson || {});
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
        JSON.stringify({ entries, deliveryFee, restaurantName, paymentsByPerson })
      );
    }
  }, [entries, deliveryFee, restaurantName, paymentsByPerson, isLoaded]);

  const feeShare = useMemo(() => {
    return entries.length > 0 ? deliveryFee / entries.length : 0;
  }, [entries.length, deliveryFee]);

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

  const updateItemDraft = useCallback((index: number, field: "item" | "price", value: string) => {
    setItems((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, [field]: value } : draft));
  }, []);

  const changeItemCount = useCallback((count: number) => {
    const nextCount = Math.max(1, Math.min(20, count || 1));
    setItemCount(nextCount);
    setItems((current) => Array.from({ length: nextCount }, (_, index) => current[index] || { item: "", price: "" }));
  }, []);

  const addEntry = useCallback(() => {
    const drafts = items.length ? items : [{ item, price }];
    if (!name.trim() || drafts.some((draft) => !draft.item.trim() || !draft.price.trim())) return;
    const newEntries: OrderEntry[] = drafts.map((draft) => ({
      id: crypto.randomUUID(),
      name: name.trim(),
      item: draft.item.trim(),
      price: parseFloat(draft.price) || 0,
      paid: false,
      paidAmount: 0,
    }));
    setEntries((prev) => [...prev, ...newEntries]);
    setName("");
    setItem("");
    setPrice("");
    setItemCount(1);
    setItems([{ item: "", price: "" }]);
  }, [name, item, price, items]);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);


  const startEditing = useCallback((entry: OrderEntry) => {
    setEditingId(entry.id);
    setEditingName(entry.name);
    setEditingItem(entry.item);
    setEditingPrice(String(entry.price));
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId || !editingName.trim() || !editingItem.trim() || !editingPrice.trim()) return;
    setEntries((current) =>
      current.map((entry) =>
        entry.id === editingId
          ? { ...entry, name: editingName.trim(), item: editingItem.trim(), price: parseFloat(editingPrice) || 0 }
          : entry
      )
    );
    setEditingId(null);
  }, [editingId, editingName, editingItem, editingPrice]);

  const collectMoney = useMemo(() => {
    return entries.reduce<Record<string, { total: number; paid: number }>>((totals, entry) => {
      const person = totals[entry.name] || { total: 0, paid: 0 };
      totals[entry.name] = {
        total: person.total + entry.price + feeShare,
        paid: paymentsByPerson[entry.name] || 0,
      };
      return totals;
    }, {});
  }, [entries, feeShare, paymentsByPerson]);

  const updatePersonPayment = useCallback((person: string, value: string) => {
    const paid = Math.max(0, parseFloat(value) || 0);
    setPaymentsByPerson((current) => ({ ...current, [person]: paid }));
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
  setDeliveryFee(0);
  setRestaurantName("");
  setPaymentsByPerson({});
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-[#27235C] text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Main App */}
      <div className="no-print min-h-screen bg-[#F8F9FA]">
        {/* Header - Flat Design */}
  <header className="bg-[#27235C] py-4">
  <div className="max-w-4xl mx-auto px-4">
  <h1 className="text-2xl font-semibold text-white text-center tracking-tight">
  Sutherland Order Tracker
  </h1>
            <p className="text-center text-white/70 mt-1 text-sm">
              Egypt Office
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
          {/* Restaurant Section */}
          <section className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27235C] flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#212529]">Restaurant</h2>
            </div>
            <Input
              type="text"
              placeholder="Enter restaurant name"
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
              <h2 className="text-lg font-semibold text-[#212529]">Add New Order</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#6C757D]">Name</label>
                  <Input placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="item-count" className="text-sm font-medium text-[#6C757D]">Number of items</label>
                  <Input id="item-count" type="number" min={1} max={20} value={itemCount} onChange={(e) => changeItemCount(parseInt(e.target.value, 10))} className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {items.map((draft, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
                    <Input placeholder={`Item ${index + 1} description`} value={draft.item} onChange={(e) => updateItemDraft(index, "item", e.target.value)} className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]" />
                    <Input type="number" min={0} step="0.01" placeholder="Price (EGP)" value={draft.price} onChange={(e) => updateItemDraft(index, "price", e.target.value)} className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]" />
                  </div>
                ))}
              </div>
              <Button
                onClick={addEntry}
                disabled={!name.trim() || items.some((draft) => !draft.item.trim() || !draft.price.trim())}
                className="h-12 bg-[#DE1B54] hover:bg-[#c01848] text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Order
              </Button>
            </div>
          </section>

          {/* Delivery Fee Section */}
          <section className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27235C] flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-[#212529]">Delivery Fee</h2>
            </div>
            <Input
              type="number"
              placeholder="Total delivery fee (will be split equally)"
              value={deliveryFee || ""}
              onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
              className="h-12 text-base bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]"
            />
            {entries.length > 0 && deliveryFee > 0 && (
              <div className="mt-4 p-4 bg-[#F8F9FA] rounded-lg flex items-center justify-between">
                <span className="text-sm text-[#6C757D]">
                  Fee per person ({entries.length} participant{entries.length !== 1 ? "s" : ""})
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
                Members
                {entries.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-[#6C757D]">
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
                <p className="text-[#6C757D]">No orders yet. Add your first order above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#E9ECEF]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#27235C]">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#27235C]">Item</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[#27235C]">Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[#27235C]">Fee</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[#27235C]">Total</th>
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
                          {editingId === entry.id ? (
                            <Input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="h-9 min-w-32" aria-label="Edit member name" />
                          ) : (
                            <div className="flex items-center gap-2">
                              {entry.paid && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                              <span className="font-medium text-[#212529]">{entry.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-[#6C757D]">
                          {editingId === entry.id ? (
                            <Input value={editingItem} onChange={(event) => setEditingItem(event.target.value)} className="h-9 min-w-40" aria-label="Edit item description" />
                          ) : entry.item}
                        </td>
                        <td className="py-4 px-4 text-right text-[#212529]">
                          {editingId === entry.id ? <Input type="number" min={0} step="0.01" value={editingPrice} onChange={(event) => setEditingPrice(event.target.value)} className="h-9 w-28 ml-auto" aria-label="Edit item price" /> : formatEGP(entry.price)}
                        </td>
                        <td className="py-4 px-4 text-right text-[#DE1B54] font-medium">{formatEGP(feeShare)}</td>
                        <td className="py-4 px-4 text-right font-semibold text-[#27235C]">
                          {formatEGP(entry.price + feeShare)}
                        </td>
  <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            {editingId === entry.id ? (
                              <Button size="sm" onClick={saveEdit} className="h-8 bg-[#27235C] text-white">Save</Button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => startEditing(entry)} className="h-8 w-8 p-0 text-[#6C757D] hover:text-[#27235C] hover:bg-slate-50" aria-label={`Edit ${entry.name}`}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => removeEntry(entry.id)} className="h-8 w-8 p-0 text-[#6C757D] hover:text-[#DE1B54] hover:bg-red-50" aria-label={`Remove ${entry.name}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                <h2 className="text-lg font-semibold text-[#212529]">Order Summary</h2>
              </div>

              <div className="bg-[#F8F9FA] rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-[#27235C] mb-3">Items to Order:</h3>
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
                  <span className="text-[#6C757D]">Subtotal</span>
                  <span className="text-[#212529]">{formatEGP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C757D]">Delivery Fee</span>
                  <span className="text-[#DE1B54]">{formatEGP(deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#E9ECEF]">
                  <span className="font-semibold text-[#212529]">Grand Total</span>
                  <span className="font-bold text-xl text-[#27235C]">{formatEGP(grandTotal)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
            <Button
              onClick={handlePrint}
              disabled={entries.length === 0}
              className="h-12 px-6 bg-[#27235C] hover:bg-[#1e1b47] text-white font-medium rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Copy Receipt
            </Button>

            <Button
              onClick={() => setShowCollection((visible) => !visible)}
              disabled={entries.length === 0}
              variant="outline"
              className="h-12 px-6 border-[#27235C] text-[#27235C] hover:bg-[#27235C] hover:text-white font-medium rounded-lg transition-colors"
            >
              <WalletCards className="h-4 w-4 mr-2" />
              Collect Money
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={entries.length === 0}
                  className="h-12 px-6 border-[#E9ECEF] text-[#6C757D] hover:border-[#DE1B54] hover:text-[#DE1B54] hover:bg-red-50 font-medium rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#212529]">Clear All Orders?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#6C757D]">
                    This will remove all orders and reset the delivery fee. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAll}
                    className="bg-[#DE1B54] hover:bg-[#c01848] text-white rounded-lg"
                  >
                    Yes, Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {showCollection && entries.length > 0 && (
            <section className="bg-white rounded-lg p-6 mb-6" aria-live="polite">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#DE1B54] flex items-center justify-center">
                  <WalletCards className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#212529]">Money to Collect</h2>
                  <p className="text-sm text-[#6C757D]">Each person&apos;s total receipt</p>
                </div>
              </div>
              <div className="divide-y divide-[#E9ECEF]">
                {Object.entries(collectMoney).map(([person, balance]) => {
                  const remaining = balance.total - balance.paid;
                  const status = remaining > 0.005 ? `Remaining ${formatEGP(remaining)}` : remaining < -0.005 ? `Change ${formatEGP(Math.abs(remaining))}` : "Paid in full";
                  return (
<div key={person} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
  <span className="font-medium text-[#212529]">{person}</span>
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
  <label className="sr-only" htmlFor={`payment-${person}`}>Amount paid by {person}</label>
  <Input id={`payment-${person}`} type="number" min={0} step="0.01" value={balance.paid || ""} onChange={(event) => updatePersonPayment(person, event.target.value)} placeholder="Amount paid" className="h-9 w-32 text-right" />
  <div className="text-left sm:text-right">
  <div className="font-semibold text-[#27235C]">Total {formatEGP(balance.total)}</div>
  <div className={`text-sm ${remaining === 0 ? "text-emerald-600" : remaining < 0 ? "text-amber-600" : "text-[#DE1B54]"}`}>{status} · Paid {formatEGP(balance.paid)}</div>
  </div>
  </div>
  </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-sm text-[#6C757D]">
          Sutherland Egypt Office
        </footer>
      </div>

      {/* Print Receipt */}
      <div className="print-receipt hidden print:block">
        <div className="text-center mb-4">
          <div className="text-lg font-bold tracking-wider">
            ================================
          </div>
          <div className="text-xl font-bold my-2">SUTHERLAND ORDER TRACKER</div>
          <div className="text-sm">Egypt Office</div>
          {restaurantName && (
            <div className="text-sm font-bold mt-1">{restaurantName}</div>
          )}
          <div className="text-lg font-bold tracking-wider">
            ================================
          </div>
        </div>

        <div className="my-4">
          <div className="text-xs mb-2">
            Date: {new Date().toLocaleDateString("en-GB")}
          </div>
          <div className="border-b border-dashed border-black my-2" />
        </div>

        <div className="mb-4">
          <div className="font-bold mb-2">ORDERS:</div>
          {entries.map((entry, index) => (
            <div key={entry.id} className="mb-2">
              <div>
                {index + 1}. {entry.name}
              </div>
              <div className="pl-4">
                {entry.item} - {formatEGP(entry.price)}
              </div>
              <div className="pl-4">
                + Fee: {formatEGP(feeShare)}
              </div>
              <div className="pl-4 font-bold">
                = {formatEGP(entry.price + feeShare)}
                {entry.paid ? " [PAID]" : ""}
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-black my-2" />

        <div className="mb-4">
          <div className="font-bold mb-2">FOR RESTAURANT:</div>
          {Object.values(groupedItems).map((groupedItem, index) => (
            <div key={index}>
              {groupedItem.count}x {groupedItem.name}
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-black my-2" />

        <div className="mt-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatEGP(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery:</span>
            <span>{formatEGP(deliveryFee)}</span>
          </div>
          <div className="border-b border-dashed border-black my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>GRAND TOTAL:</span>
            <span>{formatEGP(grandTotal)}</span>
          </div>
        </div>

        <div className="text-center mt-6 text-xs">
          <div>--------------------------------</div>
          <div>Thank you!</div>
          <div>Sutherland Egypt</div>
        </div>
      </div>
    </>
  );
}

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

interface OrderEntry {
  id: string;
  name: string;
  item: string;
  price: number;
  paid: boolean;
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: OrderData = JSON.parse(saved);
        setEntries(data.entries || []);
        setDeliveryFee(data.deliveryFee || 0);
        setRestaurantName(data.restaurantName || "");
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
        JSON.stringify({ entries, deliveryFee, restaurantName })
      );
    }
  }, [entries, deliveryFee, restaurantName, isLoaded]);

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

  const togglePaid = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, paid: !entry.paid } : entry
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
        <header className="bg-[#27235C] py-6">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#6C757D]">Name</label>
                  <Input
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#6C757D]">Item</label>
                  <Input
                    placeholder="e.g., Rob3 far5a"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    className="h-12 bg-[#F8F9FA] border-0 focus-visible:ring-2 focus-visible:ring-[#27235C]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#6C757D]">Price (EGP)</label>
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
                      <th className="text-center py-3 px-4 text-sm font-semibold text-[#27235C]">Paid</th>
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
                        <td className="py-4 px-4 text-right text-[#212529]">{formatEGP(entry.price)}</td>
                        <td className="py-4 px-4 text-right text-[#DE1B54] font-medium">{formatEGP(feeShare)}</td>
                        <td className="py-4 px-4 text-right font-semibold text-[#27235C]">
                          {formatEGP(entry.price + feeShare)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={entry.paid}
                            onCheckedChange={() => togglePaid(entry.id)}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
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
              Print Receipt
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

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  Package,
  Users,
  Receipt,
  Truck,
} from "lucide-react";

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

const STORAGE_KEY = "sutherland-order-tracker";

export function OrderTracker() {
  const [entries, setEntries] = useState<OrderEntry[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [restaurantName, setRestaurantName] = useState("");
  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
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

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ entries, deliveryFee, restaurantName })
      );
    }
  }, [entries, deliveryFee, restaurantName, isLoaded]);

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

  // Calculate fee share per person
  const feeShare =
    entries.length > 0 ? deliveryFee / entries.length : 0;

  // Calculate totals
  const subtotal = entries.reduce((sum, entry) => sum + entry.price, 0);
  const grandTotal = subtotal + deliveryFee;

  // Group identical items for order summary
  const groupedItems = entries.reduce(
    (acc, entry) => {
      const itemLower = entry.item.toLowerCase().trim();
      if (acc[itemLower]) {
        acc[itemLower].count++;
      } else {
        acc[itemLower] = { name: entry.item, count: 1 };
      }
      return acc;
    },
    {} as Record<string, { name: string; count: number }>
  );

  const handlePrint = () => {
    window.print();
  };

  const formatEGP = (amount: number) => {
    return `${amount.toFixed(2)} EGP`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00447C]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Main App - Hidden when printing */}
      <div className="no-print min-h-screen bg-gradient-to-b from-[#00447C] to-[#003366]">
        {/* Header */}
        <header className="bg-[#00447C] border-b border-[#003366] shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-3">
              <Package className="h-8 w-8 text-[#C9A227]" />
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-balance">
                Sutherland Order Tracker
              </h1>
            </div>
            <p className="text-center text-[#E5E7EB] mt-2 text-sm">
              Egypt Office - Food Order Management
            </p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          {/* Restaurant Name Card */}
          <Card className="border-[#C9A227] border-2 bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#00447C] to-[#003366] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-[#C9A227]" />
                Restaurant
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Field>
                <FieldLabel className="text-[#00447C] font-semibold">
                  Restaurant Name
                </FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter restaurant name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="text-lg font-medium border-[#00447C] focus:ring-[#C9A227]"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Add Order Form */}
          <Card className="bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#00447C] to-[#003366] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-[#C9A227]" />
                Add New Order
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel className="text-[#00447C] font-semibold">
                      Name
                    </FieldLabel>
                    <Input
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-[#00447C] focus:ring-[#C9A227]"
                      onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[#00447C] font-semibold">
                      Item Description
                    </FieldLabel>
                    <Input
                      placeholder="e.g., Rob3 far5a"
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                      className="border-[#00447C] focus:ring-[#C9A227]"
                      onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[#00447C] font-semibold">
                      Price (EGP)
                    </FieldLabel>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border-[#00447C] focus:ring-[#C9A227]"
                      onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    />
                  </Field>
                </div>
                <Button
                  onClick={addEntry}
                  disabled={!name.trim() || !item.trim() || !price.trim()}
                  className="w-full md:w-auto bg-[#00447C] hover:bg-[#003366] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Order
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Delivery Fee Card */}
          <Card className="bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#00447C] to-[#003366] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-[#C9A227]" />
                Total Delivery Fee
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Field>
                <FieldLabel className="text-[#00447C] font-semibold">
                  Enter total delivery fee (will be split equally)
                </FieldLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={deliveryFee || ""}
                  onChange={(e) =>
                    setDeliveryFee(parseFloat(e.target.value) || 0)
                  }
                  className="text-lg font-medium border-[#00447C] focus:ring-[#C9A227]"
                />
              </Field>
              {entries.length > 0 && deliveryFee > 0 && (
                <p className="mt-3 text-sm text-[#00447C] bg-[#E5E7EB] p-3 rounded-md">
                  Fee per person:{" "}
                  <span className="font-bold text-[#C9A227]">
                    {formatEGP(feeShare)}
                  </span>{" "}
                  ({entries.length} participant{entries.length !== 1 ? "s" : ""})
                </p>
              )}
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card className="bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#00447C] to-[#003366] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-[#C9A227]" />
                Members ({entries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-0 md:px-6">
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 text-[#E5E7EB]" />
                  <p>No orders yet. Add your first order above.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#E5E7EB]">
                      <TableHead className="text-[#00447C] font-bold">Name</TableHead>
                      <TableHead className="text-[#00447C] font-bold">Item</TableHead>
                      <TableHead className="text-[#00447C] font-bold text-right">Price</TableHead>
                      <TableHead className="text-[#00447C] font-bold text-right">Fee Share</TableHead>
                      <TableHead className="text-[#00447C] font-bold text-right">Total</TableHead>
                      <TableHead className="text-[#00447C] font-bold text-center">Paid</TableHead>
                      <TableHead className="text-[#00447C] font-bold text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className={entry.paid ? "bg-green-50" : ""}
                      >
                        <TableCell className="font-medium text-[#00447C]">
                          {entry.name}
                        </TableCell>
                        <TableCell>{entry.item}</TableCell>
                        <TableCell className="text-right">
                          {formatEGP(entry.price)}
                        </TableCell>
                        <TableCell className="text-right text-[#C9A227] font-medium">
                          {formatEGP(feeShare)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#00447C]">
                          {formatEGP(entry.price + feeShare)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={entry.paid}
                              onCheckedChange={() => togglePaid(entry.id)}
                              className="data-[state=checked]:bg-green-600"
                            />
                            <span
                              className={`text-xs font-medium ${
                                entry.paid ? "text-green-600" : "text-muted-foreground"
                              }`}
                            >
                              {entry.paid ? "Paid" : "Unpaid"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(entry.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          {entries.length > 0 && (
            <Card className="bg-white shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[#C9A227] to-[#B8911F] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="h-5 w-5" />
                  Order Summary (for Restaurant)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-[#E5E7EB] rounded-lg p-4">
                  <h3 className="font-bold text-[#00447C] mb-3">Items to Order:</h3>
                  <ul className="space-y-2">
                    {Object.values(groupedItems).map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-[#00447C]"
                      >
                        <span className="bg-[#00447C] text-white text-xs px-2 py-1 rounded-full font-bold">
                          {item.count}x
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-[#00447C]">Subtotal:</div>
                    <div className="text-right font-medium">{formatEGP(subtotal)}</div>
                    <div className="text-[#00447C]">Delivery Fee:</div>
                    <div className="text-right font-medium text-[#C9A227]">
                      {formatEGP(deliveryFee)}
                    </div>
                    <div className="text-[#00447C] font-bold text-lg">Grand Total:</div>
                    <div className="text-right font-bold text-lg text-[#00447C]">
                      {formatEGP(grandTotal)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePrint}
              disabled={entries.length === 0}
              className="bg-[#C9A227] hover:bg-[#B8911F] text-white"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={entries.length === 0}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Orders?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all orders and reset the delivery fee. This
                    action cannot be undone. Are you sure you want to start fresh
                    for a new day?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAll}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Yes, Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#003366] text-white py-4 mt-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[#E5E7EB]">
            <p>Sutherland Egypt Office - Order Tracker</p>
          </div>
        </footer>
      </div>

      {/* Print Receipt - Only visible when printing */}
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
          <div className="border-b border-dashed border-black my-2" />
          {Object.values(groupedItems).map((item, index) => (
            <div key={index} className="flex justify-between text-sm py-1">
              <span>
                {item.count}x {item.name}
              </span>
            </div>
          ))}
          <div className="border-b border-dashed border-black my-2" />
        </div>

        <div className="mb-4">
          <div className="font-bold mb-2">INDIVIDUAL TOTALS:</div>
          <div className="border-b border-dashed border-black my-2" />
          {entries.map((entry) => (
            <div key={entry.id} className="flex justify-between text-sm py-1">
              <span className="truncate max-w-[45%]">{entry.name}</span>
              <span className="font-medium">{formatEGP(entry.price + feeShare)}</span>
            </div>
          ))}
          <div className="border-b border-dashed border-black my-2" />
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm py-1">
            <span>Subtotal:</span>
            <span>{formatEGP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span>Delivery Fee:</span>
            <span>{formatEGP(deliveryFee)}</span>
          </div>
          <div className="border-b border-dashed border-black my-2" />
          <div className="flex justify-between font-bold text-lg py-2">
            <span>GRAND TOTAL:</span>
            <span>{formatEGP(grandTotal)}</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="border-b border-dashed border-black my-2" />
          <div className="text-xs my-2">Thank you!</div>
          <div className="text-lg font-bold tracking-wider">
            ================================
          </div>
        </div>
      </div>
    </>
  );
}

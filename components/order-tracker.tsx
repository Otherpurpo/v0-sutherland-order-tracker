"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Package,
  Plus,
  Truck,
  Users,
  Receipt,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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

  // Calculate fee share per person
  const feeShare = useMemo(() => {
    return entries.length > 0 ? deliveryFee / entries.length : 0;
  }, [entries.length, deliveryFee]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.price, 0);
  }, [entries]);

  const grandTotal = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  // Group items for order summary
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
      <div className="min-h-screen flex items-center justify-center bg-[#27235C]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Main App - Hidden when printing */}
      <div className="no-print min-h-screen bg-gradient-to-b from-[#27235C] to-[#1a1740]">
        {/* Header */}
        <header className="bg-[#27235C] border-b border-[#1a1740] shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-3">
              <Package className="h-8 w-8 text-[#DE1B54]" />
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
          <Card className="border-[#DE1B54] border-2 bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#27235C] to-[#1a1740] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-[#DE1B54]" />
                Restaurant
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Field>
                <FieldLabel className="text-[#27235C] font-semibold">
                  Restaurant Name
                </FieldLabel>
                <Input
                  type="text"
                  placeholder="Enter restaurant name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="text-lg font-medium border-[#27235C] focus:ring-[#DE1B54]"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Add Order Form */}
          <Card className="bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#27235C] to-[#1a1740] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-[#DE1B54]" />
                Add New Order
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel className="text-[#27235C] font-semibold">
                      Name
                    </FieldLabel>
                    <Input
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-[#27235C] focus:ring-[#DE1B54]"
                      onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[#27235C] font-semibold">
                      Item Description
                    </FieldLabel>
                    <Input
                      placeholder="e.g., Rob3 far5a"
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                      className="border-[#27235C] focus:ring-[#DE1B54]"
                      onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-[#27235C] font-semibold">
                      Price (EGP)
                    </FieldLabel>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border-[#27235C] focus:ring-[#DE1B54]"
                      onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    />
                  </Field>
                </div>
                <Button
                  onClick={addEntry}
                  disabled={!name.trim() || !item.trim() || !price.trim()}
                  className="w-full md:w-auto bg-[#27235C] hover:bg-[#1a1740] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Order
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Delivery Fee Card */}
          <Card className="bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#27235C] to-[#1a1740] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-[#DE1B54]" />
                Total Delivery Fee
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Field>
                <FieldLabel className="text-[#27235C] font-semibold">
                  Enter total delivery fee (will be split equally)
                </FieldLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={deliveryFee || ""}
                  onChange={(e) =>
                    setDeliveryFee(parseFloat(e.target.value) || 0)
                  }
                  className="text-lg font-medium border-[#27235C] focus:ring-[#DE1B54]"
                />
              </Field>
              {entries.length > 0 && deliveryFee > 0 && (
                <p className="mt-3 text-sm text-[#27235C] bg-[#E5E7EB] p-3 rounded-md">
                  Fee per person:{" "}
                  <span className="font-bold text-[#DE1B54]">
                    {formatEGP(feeShare)}
                  </span>{" "}
                  ({entries.length} participant{entries.length !== 1 ? "s" : ""})
                </p>
              )}
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card className="bg-white shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#27235C] to-[#1a1740] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-[#DE1B54]" />
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#E5E7EB]">
                        <TableHead className="text-[#27235C] font-bold">Name</TableHead>
                        <TableHead className="text-[#27235C] font-bold">Item</TableHead>
                        <TableHead className="text-[#27235C] font-bold text-right">Price</TableHead>
                        <TableHead className="text-[#27235C] font-bold text-right">Fee Share</TableHead>
                        <TableHead className="text-[#27235C] font-bold text-right">Total</TableHead>
                        <TableHead className="text-[#27235C] font-bold text-center">Paid</TableHead>
                        <TableHead className="text-[#27235C] font-bold text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className={entry.paid ? "bg-green-50" : ""}
                        >
                          <TableCell className="font-medium text-[#27235C]">
                            {entry.name}
                          </TableCell>
                          <TableCell>{entry.item}</TableCell>
                          <TableCell className="text-right">
                            {formatEGP(entry.price)}
                          </TableCell>
                          <TableCell className="text-right text-[#DE1B54] font-medium">
                            {formatEGP(feeShare)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-[#27235C]">
                            {formatEGP(entry.price + feeShare)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={entry.paid}
                              onCheckedChange={() => togglePaid(entry.id)}
                              className="data-[state=checked]:bg-green-500"
                            />
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          {entries.length > 0 && (
            <Card className="bg-white shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[#DE1B54] to-[#b81747] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="h-5 w-5" />
                  Order Summary (for Restaurant)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-[#E5E7EB] rounded-lg p-4">
                  <h3 className="font-bold text-[#27235C] mb-3">Items to Order:</h3>
                  <ul className="space-y-2">
                    {Object.values(groupedItems).map((groupedItem, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-[#27235C]"
                      >
                        <span className="bg-[#27235C] text-white text-xs px-2 py-1 rounded-full font-bold">
                          {groupedItem.count}x
                        </span>
                        <span className="font-medium">{groupedItem.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-[#27235C]">Subtotal:</div>
                    <div className="text-right font-medium">{formatEGP(subtotal)}</div>
                    <div className="text-[#27235C]">Delivery Fee:</div>
                    <div className="text-right font-medium text-[#DE1B54]">
                      {formatEGP(deliveryFee)}
                    </div>
                    <div className="text-[#27235C] font-bold text-lg">Grand Total:</div>
                    <div className="text-right font-bold text-lg text-[#27235C]">
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
              className="bg-[#DE1B54] hover:bg-[#b81747] text-white"
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
        <footer className="bg-[#1a1740] text-white py-4 mt-8">
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

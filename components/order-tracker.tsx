"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  Package,
  Users,
  Receipt,
  Truck,
  Store,
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
  const [showClearModal, setShowClearModal] = useState(false);

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
    setShowClearModal(false);
  }, []);

  // Calculate fee share per person
  const feeShare = entries.length > 0 ? deliveryFee / entries.length : 0;

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
      <section className="hero is-fullheight is-primary">
        <div className="hero-body">
          <div className="container has-text-centered">
            <p className="title has-text-white">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Main App - Hidden when printing */}
      <div className="no-print" style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        {/* Hero Header */}
        <section className="hero is-primary is-small">
          <div className="hero-body">
            <div className="container has-text-centered">
              <div className="is-flex is-justify-content-center is-align-items-center mb-2" style={{ gap: "0.75rem" }}>
                <Package size={36} style={{ color: "#DE1B54" }} />
                <h1 className="title is-2 has-text-white mb-0">
                  Sutherland Order Tracker
                </h1>
              </div>
              <p className="subtitle is-6 has-text-white-ter">
                Egypt Office - Food Order Management
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="section">
          <div className="container" style={{ maxWidth: "1000px" }}>
            <div className="columns is-multiline">
              {/* Restaurant Name Card */}
              <div className="column is-12">
                <div className="card">
                  <header className="card-header">
                    <p className="card-header-title is-flex is-align-items-center" style={{ gap: "0.5rem" }}>
                      <Store size={20} style={{ color: "#DE1B54" }} />
                      Restaurant
                    </p>
                  </header>
                  <div className="card-content">
                    <div className="field">
                      <label className="label has-text-primary">Restaurant Name</label>
                      <div className="control has-icons-left">
                        <input
                          className="input"
                          type="text"
                          placeholder="Enter restaurant name"
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                        />
                        <span className="icon is-left">
                          <Store size={18} style={{ color: "#7a7a7a" }} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Order Card */}
              <div className="column is-12">
                <div className="card">
                  <header className="card-header">
                    <p className="card-header-title is-flex is-align-items-center" style={{ gap: "0.5rem" }}>
                      <Plus size={20} style={{ color: "#DE1B54" }} />
                      Add New Order
                    </p>
                  </header>
                  <div className="card-content">
                    <div className="columns is-multiline">
                      <div className="column is-12-mobile is-4-tablet">
                        <div className="field">
                          <label className="label has-text-primary">Name</label>
                          <div className="control">
                            <input
                              className="input"
                              type="text"
                              placeholder="Enter name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addEntry()}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="column is-12-mobile is-4-tablet">
                        <div className="field">
                          <label className="label has-text-primary">Item Description</label>
                          <div className="control">
                            <input
                              className="input"
                              type="text"
                              placeholder="e.g., Rob3 far5a"
                              value={item}
                              onChange={(e) => setItem(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addEntry()}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="column is-12-mobile is-4-tablet">
                        <div className="field">
                          <label className="label has-text-primary">Price (EGP)</label>
                          <div className="control">
                            <input
                              className="input"
                              type="number"
                              placeholder="0.00"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addEntry()}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="field">
                      <div className="control">
                        <button
                          className="button is-primary"
                          onClick={addEntry}
                          disabled={!name.trim() || !item.trim() || !price.trim()}
                        >
                          <span className="icon">
                            <Plus size={18} />
                          </span>
                          <span>Add Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Fee Card */}
              <div className="column is-12">
                <div className="card">
                  <header className="card-header">
                    <p className="card-header-title is-flex is-align-items-center" style={{ gap: "0.5rem" }}>
                      <Truck size={20} style={{ color: "#DE1B54" }} />
                      Total Delivery Fee
                    </p>
                  </header>
                  <div className="card-content">
                    <div className="field">
                      <label className="label has-text-primary">
                        Enter total delivery fee (will be split equally)
                      </label>
                      <div className="control has-icons-left">
                        <input
                          className="input"
                          type="number"
                          placeholder="0.00"
                          value={deliveryFee || ""}
                          onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                        />
                        <span className="icon is-left">
                          <Truck size={18} style={{ color: "#7a7a7a" }} />
                        </span>
                      </div>
                    </div>
                    {entries.length > 0 && deliveryFee > 0 && (
                      <div className="notification is-info-light">
                        <p>
                          Fee per person:{" "}
                          <strong className="has-text-accent">{formatEGP(feeShare)}</strong>
                          {" "}({entries.length} participant{entries.length !== 1 ? "s" : ""})
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Members Table Card */}
              <div className="column is-12">
                <div className="card">
                  <header className="card-header">
                    <p className="card-header-title is-flex is-align-items-center" style={{ gap: "0.5rem" }}>
                      <Users size={20} style={{ color: "#DE1B54" }} />
                      Members ({entries.length})
                    </p>
                  </header>
                  <div className="card-content">
                    {entries.length === 0 ? (
                      <div className="empty-state">
                        <Users size={64} style={{ color: "#dbdbdb" }} />
                        <p className="has-text-grey">No orders yet. Add your first order above.</p>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="table is-fullwidth is-hoverable">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Item</th>
                              <th className="has-text-right">Price</th>
                              <th className="has-text-right">Fee Share</th>
                              <th className="has-text-right">Total</th>
                              <th className="has-text-centered">Paid</th>
                              <th className="has-text-centered">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry) => (
                              <tr key={entry.id} className={entry.paid ? "is-paid" : ""}>
                                <td className="has-text-weight-semibold has-text-primary">
                                  {entry.name}
                                </td>
                                <td>{entry.item}</td>
                                <td className="has-text-right">{formatEGP(entry.price)}</td>
                                <td className="has-text-right has-text-accent has-text-weight-medium">
                                  {formatEGP(feeShare)}
                                </td>
                                <td className="has-text-right has-text-weight-bold has-text-primary">
                                  {formatEGP(entry.price + feeShare)}
                                </td>
                                <td className="has-text-centered">
                                  <label className="switch-label">
                                    <input
                                      type="checkbox"
                                      className="switch-input"
                                      checked={entry.paid}
                                      onChange={() => togglePaid(entry.id)}
                                    />
                                    <span className="switch-toggle"></span>
                                    <span className={`is-size-7 has-text-weight-medium ${entry.paid ? "has-text-success" : "has-text-grey"}`}>
                                      {entry.paid ? "Paid" : "Unpaid"}
                                    </span>
                                  </label>
                                </td>
                                <td className="has-text-centered">
                                  <button
                                    className="button is-small is-danger is-light"
                                    onClick={() => removeEntry(entry.id)}
                                    title="Remove order"
                                  >
                                    <span className="icon">
                                      <Trash2 size={16} />
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              {entries.length > 0 && (
                <div className="column is-12">
                  <div className="card">
                    <header className="card-header">
                      <p className="card-header-title is-accent is-flex is-align-items-center" style={{ gap: "0.5rem" }}>
                        <Receipt size={20} />
                        Order Summary (for Restaurant)
                      </p>
                    </header>
                    <div className="card-content">
                      <div className="box" style={{ backgroundColor: "#f5f5f5" }}>
                        <h4 className="title is-6 has-text-primary mb-3">Items to Order:</h4>
                        <div className="tags">
                          {Object.values(groupedItems).map((groupedItem, index) => (
                            <span key={index} className="tag is-primary is-medium is-rounded">
                              <strong className="mr-1">{groupedItem.count}x</strong> {groupedItem.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <hr />

                      <div className="columns is-mobile">
                        <div className="column">
                          <p className="has-text-primary">Subtotal:</p>
                        </div>
                        <div className="column has-text-right">
                          <p className="has-text-weight-medium">{formatEGP(subtotal)}</p>
                        </div>
                      </div>
                      <div className="columns is-mobile">
                        <div className="column">
                          <p className="has-text-primary">Delivery Fee:</p>
                        </div>
                        <div className="column has-text-right">
                          <p className="has-text-weight-medium has-text-accent">{formatEGP(deliveryFee)}</p>
                        </div>
                      </div>
                      <hr />
                      <div className="columns is-mobile">
                        <div className="column">
                          <p className="title is-5 has-text-primary mb-0">Grand Total:</p>
                        </div>
                        <div className="column has-text-right">
                          <p className="title is-5 has-text-primary mb-0">{formatEGP(grandTotal)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="column is-12">
                <div className="buttons is-centered">
                  <button
                    className="button is-accent is-medium"
                    onClick={handlePrint}
                    disabled={entries.length === 0}
                  >
                    <span className="icon">
                      <Printer size={20} />
                    </span>
                    <span>Print Receipt</span>
                  </button>
                  <button
                    className="button is-danger is-outlined is-medium"
                    onClick={() => setShowClearModal(true)}
                    disabled={entries.length === 0}
                  >
                    <span className="icon">
                      <RotateCcw size={20} />
                    </span>
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer-custom">
          <div className="content has-text-centered">
            <p>Sutherland Egypt Office - Order Tracker</p>
          </div>
        </footer>

        {/* Clear All Confirmation Modal */}
        <div className={`modal ${showClearModal ? "is-active" : ""}`}>
          <div className="modal-background" onClick={() => setShowClearModal(false)}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Clear All Orders?</p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => setShowClearModal(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              <p>
                This will remove all orders and reset the delivery fee. This action
                cannot be undone. Are you sure you want to start fresh for a new day?
              </p>
            </section>
            <footer className="modal-card-foot">
              <div className="buttons">
                <button className="button is-danger" onClick={clearAll}>
                  Yes, Clear All
                </button>
                <button className="button" onClick={() => setShowClearModal(false)}>
                  Cancel
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Print Receipt - Only visible when printing */}
      <div className="print-receipt">
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "2px" }}>
            ================================
          </div>
          <div style={{ fontSize: "18px", fontWeight: "bold", margin: "8px 0" }}>
            SUTHERLAND ORDER TRACKER
          </div>
          <div style={{ fontSize: "12px" }}>Egypt Office</div>
          {restaurantName && (
            <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>
              {restaurantName}
            </div>
          )}
          <div style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "2px" }}>
            ================================
          </div>
        </div>

        <div style={{ margin: "16px 0" }}>
          <div style={{ fontSize: "10px", marginBottom: "8px" }}>
            Date: {new Date().toLocaleDateString("en-GB")}
          </div>
          <div style={{ borderBottom: "1px dashed black", margin: "8px 0" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>ORDERS:</div>
          <div style={{ borderBottom: "1px dashed black", margin: "8px 0" }} />
          {Object.values(groupedItems).map((groupedItem, index) => (
            <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
              <span>{groupedItem.count}x {groupedItem.name}</span>
            </div>
          ))}
          <div style={{ borderBottom: "1px dashed black", margin: "8px 0" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>INDIVIDUAL TOTALS:</div>
          <div style={{ borderBottom: "1px dashed black", margin: "8px 0" }} />
          {entries.map((entry) => (
            <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
              <span style={{ maxWidth: "45%", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</span>
              <span style={{ fontWeight: "500" }}>{formatEGP(entry.price + feeShare)}</span>
            </div>
          ))}
          <div style={{ borderBottom: "1px dashed black", margin: "8px 0" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
            <span>Subtotal:</span>
            <span>{formatEGP(subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0" }}>
            <span>Delivery Fee:</span>
            <span>{formatEGP(deliveryFee)}</span>
          </div>
          <div style={{ borderBottom: "1px dashed black", margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "16px", padding: "8px 0" }}>
            <span>GRAND TOTAL:</span>
            <span>{formatEGP(grandTotal)}</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <div style={{ borderBottom: "1px dashed black", margin: "8px 0" }} />
          <div style={{ fontSize: "10px", margin: "8px 0" }}>Thank you!</div>
          <div style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "2px" }}>
            ================================
          </div>
        </div>
      </div>
    </>
  );
}

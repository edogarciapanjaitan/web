"use client";

import { useState, useCallback } from "react";
import type { ProductResult, TransactionResult } from "./pos-actions";
import ProductSearch from "./product-search";
import Cart, { type CartItem } from "./cart";
import PaymentDialog from "./payment-dialog";
import TransactionList from "./transaction-list";

// --- Types ---

interface ShiftData {
  id: string;
  startTime: string;
  startingCash: number;
  totalCashSales: number;
  totalDebitSales: number;
}

interface PosClientProps {
  shift: ShiftData;
  initialTransactions: TransactionResult[];
}

// --- Helpers ---

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Component ---

export default function PosClient({
  shift,
  initialTransactions,
}: PosClientProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [transactions, setTransactions] =
    useState<TransactionResult[]>(initialTransactions);
  const [salesCash, setSalesCash] = useState(shift.totalCashSales);
  const [salesDebit, setSalesDebit] = useState(shift.totalDebitSales);

  // -- Cart operations --

  const addToCart = useCallback((product: ProductResult) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) return;
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  }, []);

  // -- Payment --

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setShowPayment(true);
  };

  const handlePaymentSuccess = (trx: TransactionResult) => {
    setTransactions((prev) => [trx, ...prev]);

    // Update local sales counter
    if (trx.paymentMethod === "CASH") {
      setSalesCash((prev) => prev + trx.totalPrice);
    } else {
      setSalesDebit((prev) => prev + trx.totalPrice);
    }
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setCartItems([]);
  };

  return (
    <>
      <div className="pos-layout">
        {/* Left Column: Search + Cart */}
        <div className="pos-left">
          <ProductSearch onAddToCart={addToCart} />
          <Cart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Right Column: Shift Info + Transactions */}
        <div className="pos-right">
          {/* Shift summary card */}
          <div className="shift-card shift-card-active pos-shift-card">
            <div className="shift-card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
              </svg>
              <h3>Info Shift</h3>
            </div>
            <div className="pos-shift-stats">
              <div className="pos-stat">
                <span className="pos-stat-label">Mulai</span>
                <span className="pos-stat-value">{formatTime(shift.startTime)}</span>
              </div>
              <div className="pos-stat">
                <span className="pos-stat-label">Uang Awal</span>
                <span className="pos-stat-value">{formatCurrency(shift.startingCash)}</span>
              </div>
              <div className="pos-stat">
                <span className="pos-stat-label">Penjualan Tunai</span>
                <span className="pos-stat-value pos-stat-cash">{formatCurrency(salesCash)}</span>
              </div>
              <div className="pos-stat">
                <span className="pos-stat-label">Penjualan Debit</span>
                <span className="pos-stat-value pos-stat-debit">{formatCurrency(salesDebit)}</span>
              </div>
            </div>
          </div>

          <TransactionList transactions={transactions} />
        </div>
      </div>

      {/* Payment Dialog (modal overlay) */}
      {showPayment && (
        <PaymentDialog
          items={cartItems}
          shiftId={shift.id}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}

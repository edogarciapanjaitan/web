"use client";

import { useState, useCallback } from "react";
import type { ProductResult, TransactionResult } from "./pos-actions";
import ProductSearch from "./product-search";
import ProductCatalog from "./product-catalog";
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
  initialDailyCashSales?: number;
  initialDailyDebitSales?: number;
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
  initialDailyCashSales,
  initialDailyDebitSales,
}: PosClientProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [transactions, setTransactions] =
    useState<TransactionResult[]>(initialTransactions);
  const [salesCash, setSalesCash] = useState(initialDailyCashSales ?? shift.totalCashSales);
  const [salesDebit, setSalesDebit] = useState(initialDailyDebitSales ?? shift.totalDebitSales);

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
      <div className="grid grid-cols-[1fr_380px] gap-6 flex-1 items-start max-[900px]:grid-cols-1">
        {/* Left Column: Search + Catalog + Cart */}
        <div className="flex flex-col gap-4">
          <ProductSearch onAddToCart={addToCart} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <ProductCatalog onAddToCart={addToCart} />
          </div>

          <Cart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Right Column: Shift Info + Transactions */}
        <div className="flex flex-col gap-4">
          {/* Shift summary card */}
          <div className="bg-(--card-bg)] border border-[rgba(34,197,94,0.15)] rounded-2xl p-6 backdrop-blur-lg shadow-[0_0_40px_-15px_rgba(34,197,94,0.1)]">
            <div className="flex items-center gap-2.5 mb-2 text-(--foreground)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
              </svg>
              <h3 className="text-[0.9375rem] font-semibold m-0">Info Shift</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Mulai</span>
                <span className="text-[0.9375rem] font-semibold">{formatTime(shift.startTime)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Uang Awal</span>
                <span className="text-[0.9375rem] font-semibold">{formatCurrency(shift.startingCash)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Penjualan Tunai (Hari Ini)</span>
                <span className="text-[0.9375rem] font-semibold text-[#86efac]">{formatCurrency(salesCash)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Penjualan Debit (Hari Ini)</span>
                <span className="text-[0.9375rem] font-semibold text-[#a5b4fc]">{formatCurrency(salesDebit)}</span>
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

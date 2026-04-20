"use client";

import type { ProductResult } from "./pos-actions";

// --- Types ---

export interface CartItem {
  product: ProductResult;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
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

// --- Component ---

export default function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="bg-(--card-bg)] border border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl backdrop-blur-lg flex flex-col">
        <div className="flex items-center gap-2 py-4 px-5 border-b border-(--card-border)] text-(--foreground)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
          </svg>
          <h3 className="text-base font-semibold m-0 flex-1">Keranjang</h3>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-8 px-5 text-(--text-muted)]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
          </svg>
          <p className="m-0 text-sm">Keranjang masih kosong</p>
          <p className="text-xs text-(--text-muted)] opacity-70 m-0">Cari dan tambahkan produk di atas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-(--card-bg)] border border-(--card-border)] rounded-2xl backdrop-blur-lg flex flex-col">
      <div className="flex items-center gap-2 py-4 px-5 border-b border-(--card-border)] text-(--foreground)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
        </svg>
        <h3 className="text-base font-semibold m-0 flex-1">Keranjang</h3>
        <span className="text-xs text-(--text-muted)] bg-[rgba(255,255,255,0.06)] py-0.5 px-2 rounded-full">{items.length} item</span>
      </div>

      <div className="max-h-87.5 overflow-y-auto">
        {items.map((item) => (
          <div key={item.product.id} className="flex flex-col gap-2 py-3.5 px-5 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium">{item.product.name}</span>
              <span className="text-xs text-(--text-muted)]">
                {formatCurrency(item.product.price)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[rgba(255,255,255,0.04)] rounded-lg border border-[rgba(255,255,255,0.08)]">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center bg-transparent border-none text-(--foreground)] text-base cursor-pointer transition-all duration-150 rounded-lg font-[inherit] hover:not-disabled:bg-[rgba(255,255,255,0.08)] disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={() =>
                    onUpdateQuantity(item.product.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center bg-transparent border-none text-(--foreground)] text-base cursor-pointer transition-all duration-150 rounded-lg font-[inherit] hover:not-disabled:bg-[rgba(255,255,255,0.08)] disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={() =>
                    onUpdateQuantity(item.product.id, item.quantity + 1)
                  }
                  disabled={item.quantity >= item.product.stock}
                >
                  +
                </button>
              </div>
              <span className="flex-1 text-right text-sm font-semibold text-(--foreground)]">
                {formatCurrency(item.product.price * item.quantity)}
              </span>
              <button
                type="button"
                className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded-md text-(--text-muted)] cursor-pointer transition-all duration-150 hover:bg-(--error-bg)] hover:text-(--error)]"
                onClick={() => onRemoveItem(item.product.id)}
                title="Hapus item"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="py-4 px-5 border-t border-(--card-border)] flex flex-col gap-3">
        <div className="flex justify-between items-center text-[0.9375rem] font-medium">
          <span>Total</span>
          <span className="text-[1.25rem] font-bold bg-linear-to-br from-white to-[rgba(255,255,255,0.8)] text-transparent bg-clip-text">{formatCurrency(totalPrice)}</span>
        </div>
        <button
          type="button"
          className="w-full py-3.25 bg-linear-to-br from-(--primary)] to-[#7c3aed] border-none rounded-xl text-white text-[0.9375rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 relative overflow-hidden flex items-center justify-center gap-2 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_8px_24px_var(--primary-glow)] disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={onCheckout}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
          </svg>
          Bayar — {formatCurrency(totalPrice)}
        </button>
      </div>
    </div>
  );
}

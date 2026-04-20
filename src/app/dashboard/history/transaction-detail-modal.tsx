"use client";

import { TransactionData } from "./history-actions";

interface TransactionDetailModalProps {
  transaction: TransactionData | null;
  onClose: () => void;
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

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + " - " + d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Component ---

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-xs flex items-center justify-center z-9999 p-6 animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <div 
        className="w-full max-w-125 bg-[rgba(18,18,28,0.98)] border border-(--card-border)] rounded-[1.25rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] animate-[fadeInUp_0.3s_ease-out] flex flex-col max-h-[85vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between py-5 px-6 border-b border-(--card-border)]">
          <h3 className="text-[1.125rem] font-semibold m-0">Detail Transaksi</h3>
          <button className="flex items-center justify-center w-8 h-8 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-lg text-(--text-muted)] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.1)] hover:text-(--foreground)]" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-6">
          {/* Invoice Header Details */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-1">
              <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">No. Invoice</span>
              <span className="text-sm font-mono">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Waktu</span>
              <span className="text-sm">{formatDateFull(transaction.createdAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Metode Pembayaran</span>
              <span className={`text-[0.6875rem] font-medium py-0.5 px-2 rounded uppercase tracking-[0.03em] w-fit ${transaction.paymentMethod === "CASH" ? "bg-[rgba(34,197,94,0.1)] text-[#86efac]" : "bg-[rgba(99,102,241,0.1)] text-[#a5b4fc]"}`}>
                {transaction.paymentMethod}
              </span>
            </div>
            {transaction.paymentMethod === "DEBIT" && transaction.debitCardNo && (
              <div className="flex flex-col gap-1">
                <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">No. Kartu Debit</span>
                <span className="text-sm font-mono">**** **** **** {transaction.debitCardNo.slice(-4)}</span>
              </div>
            )}
          </div>

          <hr className="border-0 h-px bg-(--card-border)] my-4" />

          {/* Items List */}
          <h4 className="text-xs uppercase tracking-[0.08em] text-(--text-muted)] font-semibold mb-3">Barang yang Dibeli</h4>
          <div className="flex flex-col gap-0">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{item.product.name}</span>
                  <span className="text-xs text-(--text-muted)]">
                    {item.quantity} x {formatCurrency(item.priceAtSale)}
                  </span>
                </div>
                <div className="font-semibold text-sm">
                  {formatCurrency(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          <hr className="border-0 h-px bg-(--card-border)] my-4" />

          {/* Payment Summary */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Total Belanja</span>
              <span className="font-semibold text-white">{formatCurrency(transaction.totalPrice)}</span>
            </div>
            {transaction.paymentMethod === "CASH" && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Tunai Diterima</span>
                  <span>{formatCurrency(transaction.amountPaid || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Kembalian</span>
                  <span>{formatCurrency(transaction.change || 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="py-4 px-6 border-t border-(--card-border)]">
          <button className="w-full py-3.25 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl text-(--foreground)] text-[0.9375rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

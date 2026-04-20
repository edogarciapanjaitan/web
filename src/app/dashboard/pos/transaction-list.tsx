"use client";

import type { TransactionResult } from "./pos-actions";

// --- Types ---

interface TransactionListProps {
  transactions: TransactionResult[];
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

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-[16px]">
        <div className="flex items-center gap-2 py-4 px-5 border-b border-[var(--card-border)] text-[var(--foreground)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor"/>
          </svg>
          <h3 className="text-base font-semibold m-0 flex-1">Transaksi Shift Ini</h3>
        </div>
        <div className="py-8 px-5 text-center text-[var(--text-muted)] text-sm">
          <p className="m-0">Belum ada transaksi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-[16px]">
      <div className="flex items-center gap-2 py-4 px-5 border-b border-[var(--card-border)] text-[var(--foreground)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor"/>
        </svg>
        <h3 className="text-base font-semibold m-0 flex-1">Transaksi Shift Ini</h3>
        <span className="text-xs text-[var(--text-muted)] bg-[rgba(255,255,255,0.06)] py-0.5 px-2 rounded-full font-medium">{transactions.length}</span>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {transactions.map((trx) => (
          <div key={trx.id} className="py-3 px-5 border-b border-[rgba(255,255,255,0.04)] flex flex-col gap-1 transition-colors duration-150 last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]">
            <div className="flex justify-between items-center">
              <span className="text-[0.8125rem] font-medium font-mono">{trx.invoiceNumber}</span>
              <span className="text-xs text-[var(--text-muted)]">{formatTime(trx.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-[0.6875rem] font-medium py-0.5 px-2 rounded uppercase tracking-[0.03em] ${trx.paymentMethod === "CASH" ? "bg-[rgba(34,197,94,0.1)] text-[#86efac]" : "bg-[rgba(99,102,241,0.1)] text-[#a5b4fc]"}`}>
                {trx.paymentMethod === "CASH" ? "Tunai" : "Debit"}
              </span>
              <span className="text-[0.9375rem] font-semibold">
                {formatCurrency(trx.totalPrice)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

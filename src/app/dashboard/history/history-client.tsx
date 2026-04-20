"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TransactionData } from "./history-actions";


interface HistoryClientProps {
  initialDate: string;
  initialData: TransactionData[];
  error?: string;
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

export default function HistoryClient({ initialDate, initialData, error }: HistoryClientProps) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [selectedTx, setSelectedTx] = useState<TransactionData | null>(null);

  // Handle date change and trigger SSR refresh
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    setSelectedTx(null); // Clear selected transaction when date changes
    // Push new query to URL to trigger SSR data fetch for the new date
    router.push(`/dashboard/history?date=${newDate}`);
  };

  const today = new Date().toISOString().split("T")[0];
  const isFiltered = date !== today;

  const handleReset = () => {
    setDate(today);
    setSelectedTx(null);
    router.push(`/dashboard/history?date=${today}`);
  };

  const totalSales = initialData.reduce((acc, tx) => acc + tx.totalPrice, 0);

  return (
    <div className="grid grid-cols-[1fr_380px] gap-6 flex-1 items-start max-[900px]:grid-cols-1">
      {/* LEFT COLUMN: Date Picker & Transaction List */}
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex justify-between items-center bg-[rgba(30,41,59,0.4)] backdrop-blur-[12px] border border-[var(--card-border)] rounded-xl py-4 px-6">
          <div className="flex items-center gap-4">
            <label htmlFor="history-date" className="font-medium text-[var(--text-secondary)]">Pilih Tanggal:</label>
            <input
              type="date"
              id="history-date"
              value={date}
              onChange={handleDateChange}
              className="bg-[rgba(255,255,255,0.06)] border border-[var(--card-border)] text-[var(--foreground)] py-2 px-4 rounded-lg font-[inherit] [color-scheme:dark]"
            />
            {isFiltered && (
              <button
                onClick={handleReset}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  whiteSpace: 'nowrap',
                  marginLeft: '0.5rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Hari Ini
              </button>
            )}
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-[0.05em] text-[var(--text-secondary)]">Total Transaksi</span>
              <span className="text-[1.25rem] font-bold">{initialData.length}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-[0.05em] text-[var(--text-secondary)]">Total Pendapatan</span>
              <span className="text-[1.25rem] font-bold text-[var(--success)]">{formatCurrency(totalSales)}</span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 py-3 px-4 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[#fca5a5] text-[0.8125rem] animate-[fadeIn_0.3s_ease]">
            <span>{error}</span>
          </div>
        )}

        {/* Transaction List */}
        {!error && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-[16px] mt-2">
            <div className="flex items-center gap-2 py-4 px-5 border-b border-[var(--card-border)] text-[var(--foreground)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor" />
              </svg>
              <h3 className="text-base font-semibold m-0 flex-1">Daftar Transaksi</h3>
              <span className="text-xs text-[var(--text-muted)] bg-[rgba(255,255,255,0.06)] py-0.5 px-2 rounded-full font-medium">{initialData.length}</span>
            </div>

            {initialData.length === 0 ? (
              <div className="py-8 px-5 text-center text-[var(--text-muted)] text-sm">
                <p className="m-0">Belum ada transaksi pada tanggal ini.</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {initialData.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 px-5 border-b border-[rgba(255,255,255,0.04)] flex flex-col gap-1 transition-colors duration-150 last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                    style={{
                      background: selectedTx?.id === tx.id ? 'rgba(99, 102, 241, 0.1)' : undefined,
                      borderColor: selectedTx?.id === tx.id ? 'rgba(99, 102, 241, 0.3)' : undefined,
                      borderLeft: selectedTx?.id === tx.id ? '3px solid var(--primary)' : '1px solid transparent'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[0.8125rem] font-medium font-mono">{tx.invoiceNumber}</span>
                      <span className="text-xs text-[var(--text-muted)]">{formatTime(tx.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[0.6875rem] font-medium py-0.5 px-2 rounded uppercase tracking-[0.03em] ${tx.paymentMethod === "CASH" ? "bg-[rgba(34,197,94,0.1)] text-[#86efac]" : "bg-[rgba(99,102,241,0.1)] text-[#a5b4fc]"}`}>
                        {tx.paymentMethod === "CASH" ? "Tunai" : "Debit"}
                      </span>
                      <span className="text-[0.9375rem] font-semibold">
                        {formatCurrency(tx.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Transaction Details */}
      <div className="flex flex-col gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl backdrop-blur-[16px]">
          <div className="flex items-center gap-2 py-4 px-5 border-b border-[var(--card-border)] text-[var(--foreground)]">
            <h3 className="text-base font-semibold m-0 flex-1">Detail Transaksi</h3>
            {selectedTx && (
              <span className="font-mono text-sm text-gray-400">{selectedTx.invoiceNumber}</span>
            )}
          </div>

          <div>
            {!selectedTx ? (
              <div className="flex flex-col items-center gap-1.5 py-16 px-8 text-[var(--text-muted)]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.3" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                </svg>
                <p className="mt-4 text-center text-sm text-gray-400">
                  Pilih salah satu transaksi di daftar untuk melihat detail barang dan pembayaran.
                </p>
              </div>
            ) : (
              <div>
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-3 p-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs uppercase">Waktu</span>
                    <span>{formatTime(selectedTx.createdAt)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs uppercase">Metode</span>
                    <span className={`text-[0.6875rem] font-medium py-0.5 px-2 rounded uppercase tracking-[0.03em] inline-block mt-1 w-max ${selectedTx.paymentMethod === "CASH" ? "bg-[rgba(34,197,94,0.1)] text-[#86efac]" : "bg-[rgba(99,102,241,0.1)] text-[#a5b4fc]"}`}>
                      {selectedTx.paymentMethod === "CASH" ? "Tunai" : "Debit"}
                    </span>
                  </div>
                  {selectedTx.paymentMethod === "DEBIT" && selectedTx.debitCardNo && (
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-gray-500 text-xs uppercase">No. Kartu Debit</span>
                      <span className="font-mono">**** **** **** {selectedTx.debitCardNo.slice(-4)}</span>
                    </div>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto border-t border-b border-[var(--card-border)]">
                  {selectedTx.items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 py-3.5 px-5 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-medium">{item.product.name}</span>
                        <span className="font-semibold text-sm">{formatCurrency(item.subtotal)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.quantity} x {formatCurrency(item.priceAtSale)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between font-bold text-lg mb-2">
                    <span>Total Belanja</span>
                    <span>{formatCurrency(selectedTx.totalPrice)}</span>
                  </div>

                  {selectedTx.paymentMethod === "CASH" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tunai Diterima</span>
                        <span>{formatCurrency(selectedTx.amountPaid || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">Kembalian</span>
                        <span className="text-green-400 font-medium">{formatCurrency(selectedTx.change || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

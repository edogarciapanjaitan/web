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
    <div className="pos-layout">
      {/* LEFT COLUMN: Date Picker & Transaction List */}
      <div className="pos-left">
        {/* Toolbar */}
        <div className="history-toolbar">
          <div className="history-date-picker">
            <label htmlFor="history-date">Pilih Tanggal:</label>
            <input
              type="date"
              id="history-date"
              value={date}
              onChange={handleDateChange}
              className="form-input"
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

          <div className="history-summary">
            <div className="summary-card">
              <span className="summary-label">Total Transaksi</span>
              <span className="summary-value">{initialData.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Total Pendapatan</span>
              <span className="summary-value highlight-revenue">{formatCurrency(totalSales)}</span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
          </div>
        )}

        {/* Transaction List (Styled exactly like POS TransactionList) */}
        {!error && (
          <div className="transaction-list mt-2">
            <div className="trx-list-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor" />
              </svg>
              <h3>Daftar Transaksi</h3>
              <span className="trx-count">{initialData.length}</span>
            </div>

            {initialData.length === 0 ? (
              <div className="trx-empty">
                <p>Belum ada transaksi pada tanggal ini.</p>
              </div>
            ) : (
              <div className="trx-items" style={{ maxHeight: '600px' }}>
                {initialData.map((tx) => (
                  <div
                    key={tx.id}
                    className="trx-item cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                    style={{
                      background: selectedTx?.id === tx.id ? 'rgba(99, 102, 241, 0.1)' : undefined,
                      borderColor: selectedTx?.id === tx.id ? 'rgba(99, 102, 241, 0.3)' : undefined,
                      borderLeft: selectedTx?.id === tx.id ? '3px solid var(--primary)' : '1px solid transparent'
                    }}
                  >
                    <div className="trx-item-top">
                      <span className="trx-invoice">{tx.invoiceNumber}</span>
                      <span className="trx-time">{formatTime(tx.createdAt)}</span>
                    </div>
                    <div className="trx-item-bottom">
                      <span className={`trx-method trx-method-${tx.paymentMethod.toLowerCase()}`}>
                        {tx.paymentMethod === "CASH" ? "Tunai" : "Debit"}
                      </span>
                      <span className="trx-amount">
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
      <div className="pos-right">
        <div className="cart-card">
          <div className="cart-header">
            <h3>Detail Transaksi</h3>
            {selectedTx && (
              <span className="font-mono text-sm text-gray-400">{selectedTx.invoiceNumber}</span>
            )}
          </div>

          <div className="cart-body">
            {!selectedTx ? (
              <div className="cart-empty" style={{ padding: '4rem 2rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.3" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                </svg>
                <p className="mt-4 text-center text-sm text-gray-400">
                  Pilih salah satu transaksi di daftar untuk melihat detail barang dan pembayaran.
                </p>
              </div>
            ) : (
              <div className="history-detail-content">
                {/* Header Info */}
                <div className="history-detail-info mb-4 text-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0 1rem' }}>
                  <div className="detail-group">
                    <span className="text-gray-500 text-xs uppercase">Waktu</span>
                    <span>{formatTime(selectedTx.createdAt)}</span>
                  </div>
                  <div className="detail-group">
                    <span className="text-gray-500 text-xs uppercase">Metode</span>
                    <span className={`trx-method trx-method-${selectedTx.paymentMethod.toLowerCase()} inline-block mt-1 w-max`}>
                      {selectedTx.paymentMethod === "CASH" ? "Tunai" : "Debit"}
                    </span>
                  </div>
                  {selectedTx.paymentMethod === "DEBIT" && selectedTx.debitCardNo && (
                    <div className="detail-group col-span-2">
                      <span className="text-gray-500 text-xs uppercase">No. Kartu Debit</span>
                      <span className="font-mono">**** **** **** {selectedTx.debitCardNo.slice(-4)}</span>
                    </div>
                  )}
                </div>

                <div className="cart-items" style={{ flex: 'none', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                  {selectedTx.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.product.name}</span>
                        <div className="cart-item-price-row text-xs text-gray-400">
                          {item.quantity} x {formatCurrency(item.priceAtSale)}
                        </div>
                      </div>
                      <div className="cart-item-actions" style={{ alignItems: 'flex-end' }}>
                        <span className="font-semibold text-sm">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="cart-summary" style={{ borderTop: 'none' }}>
                  <div className="summary-row font-bold text-lg mb-4">
                    <span>Total Belanja</span>
                    <span>{formatCurrency(selectedTx.totalPrice)}</span>
                  </div>

                  {selectedTx.paymentMethod === "CASH" && (
                    <>
                      <div className="summary-row text-sm">
                        <span className="text-gray-400">Tunai Diterima</span>
                        <span>{formatCurrency(selectedTx.amountPaid || 0)}</span>
                      </div>
                      <div className="summary-row text-sm mt-1">
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

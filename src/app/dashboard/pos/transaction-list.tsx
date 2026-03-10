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
      <div className="transaction-list">
        <div className="trx-list-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor"/>
          </svg>
          <h3>Transaksi Shift Ini</h3>
        </div>
        <div className="trx-empty">
          <p>Belum ada transaksi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="trx-list-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor"/>
        </svg>
        <h3>Transaksi Shift Ini</h3>
        <span className="trx-count">{transactions.length}</span>
      </div>

      <div className="trx-items">
        {transactions.map((trx) => (
          <div key={trx.id} className="trx-item">
            <div className="trx-item-top">
              <span className="trx-invoice">{trx.invoiceNumber}</span>
              <span className="trx-time">{formatTime(trx.createdAt)}</span>
            </div>
            <div className="trx-item-bottom">
              <span className={`trx-method trx-method-${trx.paymentMethod.toLowerCase()}`}>
                {trx.paymentMethod === "CASH" ? "Tunai" : "Debit"}
              </span>
              <span className="trx-amount">
                {formatCurrency(trx.totalPrice)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

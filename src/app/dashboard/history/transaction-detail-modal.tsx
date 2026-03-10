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
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content history-modal glass-panel" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="modal-header">
          <h3>Detail Transaksi</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Invoice Header Details */}
          <div className="history-detail-header">
            <div className="detail-group">
              <span className="detail-label">No. Invoice</span>
              <span className="detail-value font-mono">{transaction.invoiceNumber}</span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Waktu</span>
              <span className="detail-value">{formatDateFull(transaction.createdAt)}</span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Metode Pembayaran</span>
              <span className={`payment-badge badge-${transaction.paymentMethod.toLowerCase()}`}>
                {transaction.paymentMethod}
              </span>
            </div>
            {transaction.paymentMethod === "DEBIT" && transaction.debitCardNo && (
              <div className="detail-group">
                <span className="detail-label">No. Kartu Debit</span>
                <span className="detail-value font-mono">**** **** **** {transaction.debitCardNo.slice(-4)}</span>
              </div>
            )}
          </div>

          <hr className="history-divider" />

          {/* Items List */}
          <h4 className="detail-section-title">Barang yang Dibeli</h4>
          <div className="history-items-list">
            {transaction.items.map((item) => (
              <div key={item.id} className="history-item">
                <div className="item-info">
                  <span className="item-name">{item.product.name}</span>
                  <span className="item-qty-price">
                    {item.quantity} x {formatCurrency(item.priceAtSale)}
                  </span>
                </div>
                <div className="item-subtotal font-semibold">
                  {formatCurrency(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          <hr className="history-divider" />

          {/* Payment Summary */}
          <div className="history-payment-summary">
            <div className="summary-row">
              <span>Total Belanja</span>
              <span className="font-semibold text-white">{formatCurrency(transaction.totalPrice)}</span>
            </div>
            {transaction.paymentMethod === "CASH" && (
              <>
                <div className="summary-row text-sm">
                  <span>Tunai Diterima</span>
                  <span>{formatCurrency(transaction.amountPaid || 0)}</span>
                </div>
                <div className="summary-row text-sm">
                  <span>Kembalian</span>
                  <span>{formatCurrency(transaction.change || 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="submit-button btn-secondary w-full" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  createTransactionAction,
  type TransactionResult,
} from "./pos-actions";
import type { CartItem } from "./cart";

// --- Types ---

interface PaymentDialogProps {
  items: CartItem[];
  shiftId: string;
  onClose: () => void;
  onSuccess: (transaction: TransactionResult) => void;
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

export default function PaymentDialog({
  items,
  shiftId,
  onClose,
  onSuccess,
}: PaymentDialogProps) {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const [method, setMethod] = useState<"CASH" | "DEBIT">("CASH");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [debitCardNo, setDebitCardNo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TransactionResult | null>(null);

  const amountPaidNum = Number(amountPaid) || 0;
  const change = amountPaidNum - totalPrice;

  async function handleSubmit() {
    setError(null);
    setIsProcessing(true);

    const result = await createTransactionAction({
      shiftId,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      paymentMethod: method,
      ...(method === "CASH" ? { amountPaid: amountPaidNum } : {}),
      ...(method === "DEBIT" ? { debitCardNo: debitCardNo.trim() } : {}),
    });

    setIsProcessing(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setReceipt(result.data!);
    onSuccess(result.data!);
  }

  // --- Receipt view ---
  if (receipt) {
    return (
      <div className="payment-overlay">
        <div className="payment-dialog receipt-dialog">
          <div className="receipt">
            <div className="receipt-header">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
              <h3>Transaksi Berhasil!</h3>
              <p className="receipt-invoice">{receipt.invoiceNumber}</p>
            </div>

            <div className="receipt-items">
              {receipt.items.map((item) => (
                <div key={item.id} className="receipt-item">
                  <div className="receipt-item-info">
                    <span>{item.product.name}</span>
                    <span className="receipt-item-qty">
                      {item.quantity} × {formatCurrency(item.priceAtSale)}
                    </span>
                  </div>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="receipt-summary">
              <div className="receipt-row receipt-total">
                <span>Total</span>
                <span>{formatCurrency(receipt.totalPrice)}</span>
              </div>
              {receipt.paymentMethod === "CASH" && (
                <>
                  <div className="receipt-row">
                    <span>Tunai</span>
                    <span>{formatCurrency(receipt.amountPaid!)}</span>
                  </div>
                  <div className="receipt-row receipt-change">
                    <span>Kembalian</span>
                    <span>{formatCurrency(receipt.change!)}</span>
                  </div>
                </>
              )}
              {receipt.paymentMethod === "DEBIT" && (
                <div className="receipt-row">
                  <span>Debit</span>
                  <span>•••• {receipt.debitCardNo?.slice(-4)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="submit-button"
              onClick={onClose}
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Payment form view ---
  return (
    <div className="payment-overlay" onClick={onClose}>
      <div
        className="payment-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="payment-header">
          <h3>Pembayaran</h3>
          <button type="button" className="payment-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div className="payment-total-banner">
          <span>Total Pembayaran</span>
          <span className="payment-total-amount">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
          </div>
        )}

        {/* Payment method selector */}
        <div className="payment-methods">
          <button
            type="button"
            className={`payment-method-btn ${method === "CASH" ? "active" : ""}`}
            onClick={() => setMethod("CASH")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
            </svg>
            Tunai
          </button>
          <button
            type="button"
            className={`payment-method-btn ${method === "DEBIT" ? "active" : ""}`}
            onClick={() => setMethod("DEBIT")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
            </svg>
            Debit
          </button>
        </div>

        {/* Cash input */}
        {method === "CASH" && (
          <div className="payment-input-section">
            <div className="form-group">
              <label htmlFor="amountPaid" className="form-label">
                Uang Diterima (Rp)
              </label>
              <div className="input-wrapper">
                <span className="input-prefix">Rp</span>
                <input
                  id="amountPaid"
                  type="number"
                  className="form-input form-input-prefixed"
                  placeholder="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  min={0}
                  autoFocus
                  disabled={isProcessing}
                />
              </div>
            </div>
            {amountPaidNum > 0 && (
              <div
                className={`change-display ${change >= 0 ? "change-ok" : "change-insufficient"}`}
              >
                <span>{change >= 0 ? "Kembalian" : "Kurang"}</span>
                <span className="change-amount">
                  {formatCurrency(Math.abs(change))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Debit input */}
        {method === "DEBIT" && (
          <div className="payment-input-section">
            <div className="form-group">
              <label htmlFor="debitCardNo" className="form-label">
                Nomor Kartu Debit
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
                </svg>
                <input
                  id="debitCardNo"
                  type="text"
                  className="form-input"
                  placeholder="Masukkan nomor kartu"
                  value={debitCardNo}
                  onChange={(e) => setDebitCardNo(e.target.value)}
                  maxLength={20}
                  autoFocus
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        )}

        {/* Items summary */}
        <div className="payment-items-summary">
          <span className="payment-items-label">
            {items.length} produk dalam keranjang
          </span>
        </div>

        {/* Submit */}
        <button
          type="button"
          className="submit-button payment-submit-btn"
          onClick={handleSubmit}
          disabled={
            isProcessing ||
            (method === "CASH" && change < 0) ||
            (method === "DEBIT" && debitCardNo.trim().length < 4)
          }
        >
          {isProcessing ? (
            <span className="loading-wrapper">
              <span className="spinner" />
              <span>Memproses...</span>
            </span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              </svg>
              Proses Transaksi
            </>
          )}
        </button>
      </div>
    </div>
  );
}

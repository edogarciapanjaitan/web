"use client";

import { useState } from "react";
import {
  createTransactionAction,
  type TransactionResult,
} from "./pos-actions";
import type { CartItem } from "./cart";
import { useConfirm } from "@/components/confirm-dialog";

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
  const [debitError, setDebitError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TransactionResult | null>(null);

  const amountPaidNum = Number(amountPaid) || 0;
  const change = amountPaidNum - totalPrice;

  const digitsOnly = debitCardNo.replace(/\D/g, "");
  const { confirm, ConfirmDialogElement } = useConfirm();

  async function handleSubmit() {
    setError(null);
    setDebitError(null);

    if (method === "DEBIT" && digitsOnly.length !== 16) {
      setDebitError("Nomor kartu debit harus 16 digit");
      return;
    }

    const confirmed = await confirm({
      title: "Proses Transaksi?",
      message: `Total pembayaran ${formatCurrency(totalPrice)} dengan metode ${method === "CASH" ? "Tunai" : "Debit"}. Lanjutkan proses transaksi?`,
      confirmText: "Ya, Proses",
      variant: "default",
    });

    if (!confirmed) return;

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
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-[4px] flex items-center justify-center z-[100] p-6 animate-[fadeIn_0.2s_ease]">
        <div className="w-full max-w-[460px] bg-[rgba(18,18,28,0.98)] border border-[var(--card-border)] rounded-[1.25rem] p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] animate-[fadeInUp_0.3s_ease-out] flex flex-col gap-5 max-h-[90vh] overflow-y-auto text-center">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2 text-[var(--success)]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
              </svg>
              <h3 className="text-[1.25rem] font-bold m-0 text-[var(--foreground)]">Transaksi Berhasil!</h3>
              <p className="text-[0.8125rem] text-[var(--text-muted)] m-0 font-mono">{receipt.invoiceNumber}</p>
            </div>

            <div className="border-t border-dashed border-[rgba(255,255,255,0.1)] border-b py-3 flex flex-col gap-2">
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between items-baseline text-[0.8125rem]">
                  <div className="flex flex-col text-left gap-0.5">
                    <span>{item.product.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {item.quantity} × {formatCurrency(item.priceAtSale)}
                    </span>
                  </div>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-base font-bold text-[var(--foreground)]">
                <span>Total</span>
                <span>{formatCurrency(receipt.totalPrice)}</span>
              </div>
              {receipt.paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                    <span>Tunai</span>
                    <span>{formatCurrency(receipt.amountPaid!)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--success)] font-semibold">
                    <span>Kembalian</span>
                    <span>{formatCurrency(receipt.change!)}</span>
                  </div>
                </>
              )}
              {receipt.paymentMethod === "DEBIT" && (
                <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                  <span>Debit</span>
                  <span>•••• {receipt.debitCardNo?.slice(-4)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="w-full py-[0.8125rem] bg-gradient-to-br from-[var(--primary)] to-[#7c3aed] border-none rounded-xl text-white text-[0.9375rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_var(--primary-glow)]"
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
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-[4px] flex items-center justify-center z-[100] p-6 animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <div
        className="w-full max-w-[460px] bg-[rgba(18,18,28,0.98)] border border-[var(--card-border)] rounded-[1.25rem] p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] animate-[fadeInUp_0.3s_ease-out] flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[1.125rem] font-semibold m-0">Pembayaran</h3>
          <button type="button" className="flex items-center justify-center w-8 h-8 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[var(--text-muted)] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.1)] hover:text-[var(--foreground)]" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between py-4 px-5 bg-gradient-to-br from-[rgba(99,102,241,0.12)] to-[rgba(139,92,246,0.08)] border border-[rgba(99,102,241,0.15)] rounded-[0.875rem] text-sm text-[var(--text-secondary)]">
          <span>Total Pembayaran</span>
          <span className="text-[1.375rem] font-bold text-[var(--foreground)]">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 py-3 px-4 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[#fca5a5] text-[0.8125rem] animate-[fadeIn_0.3s_ease]">
            <span>{error}</span>
          </div>
        )}

        {/* Payment method selector */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium font-[inherit] cursor-pointer transition-all duration-200 ${method === "CASH" ? "bg-[rgba(99,102,241,0.12)] border border-[var(--primary)] text-[var(--primary-hover)] shadow-[0_0_0_1px_var(--primary)]" : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]"}`}
            onClick={() => setMethod("CASH")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
            </svg>
            Tunai
          </button>
          <button
            type="button"
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium font-[inherit] cursor-pointer transition-all duration-200 ${method === "DEBIT" ? "bg-[rgba(99,102,241,0.12)] border border-[var(--primary)] text-[var(--primary-hover)] shadow-[0_0_0_1px_var(--primary)]" : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]"}`}
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
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="amountPaid" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">
                Uang Diterima (Rp)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[var(--text-muted)] text-sm font-medium pointer-events-none">Rp</span>
                <input
                  id="amountPaid"
                  type="number"
                  className="w-full py-3 pr-3.5 pl-10 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                className={`flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium ${change >= 0 ? "bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] text-[#86efac]" : "bg-[var(--error-bg)] border border-[var(--error-border)] text-[#fca5a5]"}`}
              >
                <span>{change >= 0 ? "Kembalian" : "Kurang"}</span>
                <span className="text-[1.125rem] font-bold">
                  {formatCurrency(Math.abs(change))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Debit input */}
        {method === "DEBIT" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="debitCardNo" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">
                Nomor Kartu Debit
              </label>
              <div className="relative flex items-center">
                <svg className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none transition-colors duration-200" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
                </svg>
                <input
                  id="debitCardNo"
                  type="text"
                  className="w-full py-3 pr-3.5 pl-11 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Masukkan 16 digit nomor kartu"
                  value={debitCardNo}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 16) {
                      setDebitCardNo(val);
                      setDebitError(null);
                    }
                  }}
                  maxLength={16}
                  inputMode="numeric"
                  autoFocus
                  disabled={isProcessing}
                  style={debitError ? { borderColor: "#ef4444", boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.15)" } : {}}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                {debitError ? (
                  <div className="text-[#ef4444] text-[0.8rem] flex items-center gap-1">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {debitError}
                  </div>
                ) : <span />}
                <span className={`text-xs font-mono font-medium ${digitsOnly.length === 16 ? "text-[#10b981]" : "text-[var(--text-muted)]"}`}>
                  {digitsOnly.length}/16 digit
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Items summary */}
        <div className="text-center">
          <span className="text-xs text-[var(--text-muted)]">
            {items.length} produk dalam keranjang
          </span>
        </div>

        {/* Submit */}
        <button
          type="button"
          className="w-full py-[0.8125rem] bg-gradient-to-br from-[var(--primary)] to-[#7c3aed] border-none rounded-xl text-white text-[0.9375rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 relative overflow-hidden flex items-center justify-center gap-2 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_8px_24px_var(--primary-glow)] disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={
            isProcessing ||
            (method === "CASH" && change < 0) ||
            (method === "DEBIT" && digitsOnly.length !== 16)
          }
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-[18px] h-[18px] border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-[spin_0.6s_linear_infinite]" />
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
      {ConfirmDialogElement}
    </div>
  );
}

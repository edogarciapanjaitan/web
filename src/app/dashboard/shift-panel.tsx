"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { startShiftAction, endShiftAction } from "./shift-actions";
import { useConfirm } from "@/components/confirm-dialog";

// --- Types ---

interface ShiftData {
  id: string;
  startTime: string;
  endTime: string | null;
  startingCash: number;
  endingCash: number | null;
  totalCashSales: number;
  totalDebitSales: number;
}

interface ShiftPanelProps {
  initialShift: ShiftData | null;
  dailyCashSales?: number;
  dailyDebitSales?: number;
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// --- Elapsed Time Hook ---

function useElapsedTime(startTime: string | null) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!startTime) return;

    function update() {
      const diff = Date.now() - new Date(startTime!).getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return elapsed;
}

// --- Component ---

export default function ShiftPanel({ initialShift, dailyCashSales, dailyDebitSales }: ShiftPanelProps) {
  const [startState, startAction, isStarting] = useActionState(startShiftAction, null);
  const [endState, endAction, isEnding] = useActionState(endShiftAction, null);
  const elapsed = useElapsedTime(initialShift?.startTime ?? null);
  const { confirm, ConfirmDialogElement } = useConfirm();
  const startFormRef = useRef<HTMLFormElement>(null);
  const endFormRef = useRef<HTMLFormElement>(null);

  const handleStartShiftBtnClick = async () => {
    const form = startFormRef.current;
    if (!form) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const cash = formData.get("startingCash") as string;

    const confirmed = await confirm({
      title: "Mulai Shift?",
      message: `Anda akan memulai shift baru dengan uang awal Rp ${Number(cash || 0).toLocaleString("id-ID")}. Lanjutkan?`,
      confirmText: "Ya, Mulai",
      variant: "default",
    });

    if (confirmed) {
      form.requestSubmit();
    }
  };

  const handleEndShiftBtnClick = async () => {
    const form = endFormRef.current;
    if (!form) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const cash = formData.get("endingCash") as string;

    const confirmed = await confirm({
      title: "Akhiri Shift?",
      message: `Anda akan mengakhiri shift dengan uang akhir Rp ${Number(cash || 0).toLocaleString("id-ID")}. Shift tidak dapat dibuka kembali setelah ditutup. Lanjutkan?`,
      confirmText: "Ya, Akhiri",
      variant: "warning",
    });

    if (confirmed) {
      form.requestSubmit();
    }
  };

  if (!initialShift) {
    // --- NO ACTIVE SHIFT: Show start shift form ---
    return (
      <div className="flex flex-col gap-4 animate-[fadeInUp_0.5s_ease-out]">
        <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full text-[0.8125rem] font-medium w-fit bg-[rgba(255,255,255,0.05)] text-(--text-muted)] border border-[rgba(255,255,255,0.08)]">
          <span className="w-2 h-2 rounded-full inline-block bg-(--text-muted)]" />
          Belum ada shift aktif
        </div>

        <div className="bg-(--card-bg)] border border-(--card-border)] rounded-2xl p-6 backdrop-blur-lg shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_80px_-20px_var(--primary-glow)]">
          <div className="flex items-center gap-2.5 mb-2 text-(--foreground)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
            </svg>
            <h3 className="text-[1.0625rem] font-semibold m-0">Mulai Shift Baru</h3>
          </div>
          <p className="text-[0.8125rem] text-(--text-muted)] m-0 mb-5 leading-relaxed">
            Masukkan jumlah uang awal di mesin kasir untuk memulai shift kerja Anda.
          </p>

          {/* Error banner */}
          {startState && !startState.success && (
            <div className="flex items-center gap-2 py-3 px-4 bg-(--error-bg)] border border-(--error-border)] rounded-xl text-[#fca5a5] text-[0.8125rem] animate-[fadeIn_0.3s_ease]">
              <span>{startState.message}</span>
            </div>
          )}

          <form action={startAction} ref={startFormRef} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="startingCash" className="text-[0.8125rem] font-medium text-(--text-secondary)] tracking-[0.01em]">
                Uang Awal (Rp)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-(--text-muted)] text-sm font-medium pointer-events-none">Rp</span>
                <input
                  id="startingCash"
                  name="startingCash"
                  type="number"
                  min="0"
                  max="100000000"
                  step="1"
                  required
                  className="w-full py-3 pr-3.5 pl-10 bg-(--input-bg)] border border-(--input-border)] rounded-xl text-(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="500000"
                  disabled={isStarting}
                />
              </div>
              {startState?.errors?.startingCash && (
                <p className="text-xs text-(--error)] m-0 animate-[fadeIn_0.2s_ease]">{startState.errors.startingCash[0]}</p>
              )}
            </div>

            <button type="button" onClick={handleStartShiftBtnClick} className="w-full py-3.25 bg-linear-to-br from-[#22c55e] to-[#16a34a] border-none rounded-xl text-white text-[0.9375rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 relative overflow-hidden mt-1 flex items-center justify-center gap-2 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_8px_24px_rgba(34,197,94,0.25)] disabled:opacity-70 disabled:cursor-not-allowed" disabled={isStarting}>
              {isStarting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4.5 h-4.5 border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-[spin_0.6s_linear_infinite]" />
                  <span>Memproses...</span>
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                  Mulai Shift
                </>
              )}
            </button>
          </form>
        </div>
        {ConfirmDialogElement}
      </div>
    );
  }

  // --- ACTIVE SHIFT: Show shift info + end form ---
  return (
    <div className="flex flex-col gap-4 animate-[fadeInUp_0.5s_ease-out]">
      <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full text-[0.8125rem] font-medium w-fit bg-[rgba(34,197,94,0.1)] text-[#86efac] border border-[rgba(34,197,94,0.2)]">
        <span className="w-2 h-2 rounded-full inline-block bg-(--success)] animate-[pulse_2s_ease-in-out_infinite]" />
        Shift Aktif
      </div>

      {/* Shift Info Card */}
      <div className="bg-(--card-bg)] border border-[rgba(34,197,94,0.15)] rounded-2xl p-6 backdrop-blur-lg shadow-[0_0_40px_-15px_rgba(34,197,94,0.1)]">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Mulai</span>
            <span className="text-[1.0625rem] font-semibold text-(--foreground)]">{formatTime(initialShift.startTime)}</span>
            <span className="text-xs text-(--text-muted)]">{formatDate(initialShift.startTime)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Durasi</span>
            <span className="text-[1.25rem] font-semibold text-(--success)] font-mono">{elapsed || "00:00:00"}</span>
            <span className="text-xs text-(--text-muted)]">Berjalan</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Uang Awal</span>
            <span className="text-[1.0625rem] font-semibold text-(--foreground)]">{formatCurrency(initialShift.startingCash)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Penjualan Tunai (Hari Ini)</span>
            <span className="text-[1.0625rem] font-semibold text-(--foreground)]">{formatCurrency(dailyCashSales ?? initialShift.totalCashSales)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.6875rem] text-(--text-muted)] uppercase tracking-[0.05em] font-medium">Penjualan Debit (Hari Ini)</span>
            <span className="text-[1.0625rem] font-semibold text-(--foreground)]">{formatCurrency(dailyDebitSales ?? initialShift.totalDebitSales)}</span>
          </div>
        </div>
      </div>

      {/* End Shift Card */}
      <div className="bg-(--card-bg)] border border-(--card-border)] rounded-2xl p-6 backdrop-blur-lg">
        <div className="flex items-center gap-2.5 mb-2 text-(--foreground)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6h12v12H6z" fill="currentColor"/>
          </svg>
          <h3 className="text-[1.0625rem] font-semibold m-0">Akhiri Shift</h3>
        </div>
        <p className="text-[0.8125rem] text-(--text-muted)] m-0 mb-5 leading-relaxed">
          Hitung uang di mesin kasir dan masukkan jumlah akhir untuk menutup shift.
        </p>

        {/* Error banner */}
        {endState && !endState.success && (
          <div className="flex items-center gap-2 py-3 px-4 bg-(--error-bg)] border border-(--error-border)] rounded-xl text-[#fca5a5] text-[0.8125rem] animate-[fadeIn_0.3s_ease]">
            <span>{endState.message}</span>
          </div>
        )}

        <form action={endAction} ref={endFormRef} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="endingCash" className="text-[0.8125rem] font-medium text-(--text-secondary)] tracking-[0.01em]">
              Uang Akhir (Rp)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-(--text-muted)] text-sm font-medium pointer-events-none">Rp</span>
              <input
                id="endingCash"
                name="endingCash"
                type="number"
                min="0"
                max="100000000"
                step="1"
                required
                className="w-full py-3 pr-3.5 pl-10 bg-(--input-bg)] border border-(--input-border)] rounded-xl text-(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="750000"
                disabled={isEnding}
              />
            </div>
            {endState?.errors?.endingCash && (
              <p className="text-xs text-(--error)] m-0 animate-[fadeIn_0.2s_ease]">{endState.errors.endingCash[0]}</p>
            )}
          </div>

          <button type="button" onClick={handleEndShiftBtnClick} className="w-full py-3.25 bg-linear-to-br from-[#ef4444] to-[#dc2626] border-none rounded-xl text-white text-[0.9375rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 relative overflow-hidden mt-1 flex items-center justify-center gap-2 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_8px_24px_rgba(239,68,68,0.25)] disabled:opacity-70 disabled:cursor-not-allowed" disabled={isEnding}>
            {isEnding ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4.5 h-4.5 border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-[spin_0.6s_linear_infinite]" />
                <span>Memproses...</span>
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6h12v12H6z" fill="currentColor"/>
                </svg>
                Akhiri Shift
              </>
            )}
          </button>
        </form>
      </div>
      {ConfirmDialogElement}
    </div>
  );
}

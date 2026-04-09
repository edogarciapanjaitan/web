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

export default function ShiftPanel({ initialShift }: ShiftPanelProps) {
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
      <div className="shift-panel">
        <div className="shift-status-badge shift-status-inactive">
          <span className="status-dot status-dot-inactive" />
          Belum ada shift aktif
        </div>

        <div className="shift-card">
          <div className="shift-card-header">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
            </svg>
            <h3>Mulai Shift Baru</h3>
          </div>
          <p className="shift-card-desc">
            Masukkan jumlah uang awal di mesin kasir untuk memulai shift kerja Anda.
          </p>

          {/* Error banner */}
          {startState && !startState.success && (
            <div className="error-banner">
              <span>{startState.message}</span>
            </div>
          )}

          <form action={startAction} ref={startFormRef} className="shift-form">
            <div className="form-group">
              <label htmlFor="startingCash" className="form-label">
                Uang Awal (Rp)
              </label>
              <div className="input-wrapper">
                <span className="input-prefix">Rp</span>
                <input
                  id="startingCash"
                  name="startingCash"
                  type="number"
                  min="0"
                  max="100000000"
                  step="1"
                  required
                  className="form-input form-input-prefixed"
                  placeholder="500000"
                  disabled={isStarting}
                />
              </div>
              {startState?.errors?.startingCash && (
                <p className="field-error">{startState.errors.startingCash[0]}</p>
              )}
            </div>

            <button type="button" onClick={handleStartShiftBtnClick} className="submit-button shift-start-btn" disabled={isStarting}>
              {isStarting ? (
                <span className="loading-wrapper">
                  <span className="spinner" />
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
    <div className="shift-panel">
      <div className="shift-status-badge shift-status-active">
        <span className="status-dot status-dot-active" />
        Shift Aktif
      </div>

      {/* Shift Info Card */}
      <div className="shift-card shift-card-active">
        <div className="shift-info-grid">
          <div className="shift-info-item">
            <span className="shift-info-label">Mulai</span>
            <span className="shift-info-value">{formatTime(initialShift.startTime)}</span>
            <span className="shift-info-sub">{formatDate(initialShift.startTime)}</span>
          </div>
          <div className="shift-info-item">
            <span className="shift-info-label">Durasi</span>
            <span className="shift-info-value shift-timer">{elapsed || "00:00:00"}</span>
            <span className="shift-info-sub">Berjalan</span>
          </div>
          <div className="shift-info-item">
            <span className="shift-info-label">Uang Awal</span>
            <span className="shift-info-value">{formatCurrency(initialShift.startingCash)}</span>
          </div>
          <div className="shift-info-item">
            <span className="shift-info-label">Penjualan Tunai</span>
            <span className="shift-info-value">{formatCurrency(initialShift.totalCashSales)}</span>
          </div>
          <div className="shift-info-item">
            <span className="shift-info-label">Penjualan Debit</span>
            <span className="shift-info-value">{formatCurrency(initialShift.totalDebitSales)}</span>
          </div>
        </div>
      </div>

      {/* End Shift Card */}
      <div className="shift-card">
        <div className="shift-card-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6h12v12H6z" fill="currentColor"/>
          </svg>
          <h3>Akhiri Shift</h3>
        </div>
        <p className="shift-card-desc">
          Hitung uang di mesin kasir dan masukkan jumlah akhir untuk menutup shift.
        </p>

        {/* Error banner */}
        {endState && !endState.success && (
          <div className="error-banner">
            <span>{endState.message}</span>
          </div>
        )}

        <form action={endAction} ref={endFormRef} className="shift-form">
          <div className="form-group">
            <label htmlFor="endingCash" className="form-label">
              Uang Akhir (Rp)
            </label>
            <div className="input-wrapper">
              <span className="input-prefix">Rp</span>
              <input
                id="endingCash"
                name="endingCash"
                type="number"
                min="0"
                max="100000000"
                step="1"
                required
                className="form-input form-input-prefixed"
                placeholder="750000"
                disabled={isEnding}
              />
            </div>
            {endState?.errors?.endingCash && (
              <p className="field-error">{endState.errors.endingCash[0]}</p>
            )}
          </div>

          <button type="button" onClick={handleEndShiftBtnClick} className="submit-button shift-end-btn" disabled={isEnding}>
            {isEnding ? (
              <span className="loading-wrapper">
                <span className="spinner" />
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

"use client";

import { useState, useCallback } from "react";

// ============================
// CONFIRM DIALOG COMPONENT
// ============================

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const iconColor =
    variant === "danger"
      ? "#ef4444"
      : variant === "warning"
      ? "#f59e0b"
      : "#6366f1";

  const btnColor =
    variant === "danger"
      ? "#ef4444"
      : variant === "warning"
      ? "#f59e0b"
      : "#6366f1";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card, #1e1e2e)",
          border: "1px solid var(--border, #2e2e3e)",
          borderRadius: "1rem",
          padding: "1.75rem",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          animation: "fadeInUp 0.3s ease-out",
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: `${iconColor}20`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {variant === "danger" ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill={iconColor}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            ) : variant === "warning" ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill={iconColor}>
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill={iconColor}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            textAlign: "center",
            margin: "0 0 0.5rem",
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "var(--text-primary, #fff)",
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <p
          style={{
            textAlign: "center",
            margin: "0 0 1.5rem",
            fontSize: "0.875rem",
            color: "var(--text-secondary, #a1a1aa)",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "0.625rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "1px solid var(--border, #2e2e3e)",
              background: "transparent",
              color: "var(--text-primary, #fff)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "0.625rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              background: btnColor,
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================
// useConfirm HOOK
// ============================

/**
 * Hook untuk memudahkan penggunaan ConfirmDialog.
 *
 * Contoh penggunaan:
 * ```tsx
 * const { confirm, ConfirmDialogElement } = useConfirm();
 *
 * async function handleDelete() {
 *   const yes = await confirm({
 *     title: "Hapus Data?",
 *     message: "Data yang dihapus tidak dapat dikembalikan.",
 *     variant: "danger",
 *   });
 *   if (yes) {
 *     // lakukan delete
 *   }
 * }
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Hapus</button>
 *     {ConfirmDialogElement}
 *   </>
 * );
 * ```
 */
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning";
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: "", message: "" },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state.resolve]);

  const ConfirmDialogElement = (
    <ConfirmDialog
      open={state.open}
      title={state.options.title}
      message={state.options.message}
      confirmText={state.options.confirmText}
      cancelText={state.options.cancelText}
      variant={state.options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialogElement };
}

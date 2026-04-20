"use client";

import { useState } from "react";
import { WorkerData, createWorkerAction, updateWorkerAction } from "./workers-actions";

interface WorkerFormModalProps {
  worker?: WorkerData | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FieldErrors {
  name?: string;
  username?: string;
  role?: string;
  password?: string;
}

export default function WorkerFormModal({ worker, onClose, onSuccess }: WorkerFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateForm = (formData: FormData): boolean => {
    const errors: FieldErrors = {};

    const name = (formData.get("name") as string)?.trim();
    const username = (formData.get("username") as string)?.trim();
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;

    if (!name) {
      errors.name = "Nama lengkap harus diisi";
    }
    if (!username) {
      errors.username = "Username harus diisi";
    }
    if (!role) {
      errors.role = "Peran harus dipilih";
    }
    if (!worker) {
      if (!password || password.length < 6) {
        errors.password = "Password harus diisi (minimal 6 karakter)";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (worker) {
        result = await updateWorkerAction(worker.id, formData);
      } else {
        result = await createWorkerAction(formData);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldErrorStyle: React.CSSProperties = {
    color: "#ef4444",
    fontSize: "0.8rem",
    marginTop: "0.35rem",
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
  };

  const inputErrorStyle: React.CSSProperties = {
    borderColor: "#ef4444",
    boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.15)",
  };

  const inputClass = "w-full py-3 pr-3.5 pl-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)]";

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[4px] flex items-center justify-center z-[9999] p-6 animate-[fadeIn_0.2s_ease]">
      <div className="w-full max-w-[450px] bg-[rgba(18,18,28,0.98)] border border-[var(--card-border)] rounded-[1.25rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col max-h-[85vh] animate-[fadeInUp_0.3s_ease-out]">
        <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--card-border)]">
          <h3 className="text-[1.125rem] font-semibold m-0">{worker ? "Edit Pengguna" : "Tambah Pengguna"}</h3>
          <button type="button" onClick={onClose} className="flex items-center justify-center w-8 h-8 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[var(--text-muted)] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.1)] hover:text-[var(--foreground)] text-lg">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex-1 overflow-y-auto py-5 px-6 flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 py-3 px-4 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[#fca5a5] text-[0.8125rem] animate-[fadeIn_0.3s_ease] mb-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">Nama Lengkap</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className={inputClass}
                style={{ paddingLeft: "1rem", ...(fieldErrors.name ? inputErrorStyle : {}) }}
                defaultValue={worker?.name || ""} 
              />
              {fieldErrors.name && (
                <div style={fieldErrorStyle}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.name}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                className={inputClass}
                style={{ paddingLeft: "1rem", ...(fieldErrors.username ? inputErrorStyle : {}) }}
                defaultValue={worker?.username || ""} 
              />
              {fieldErrors.username && (
                <div style={fieldErrorStyle}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.username}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">Peran (Role)</label>
              <select 
                id="role" 
                name="role" 
                className={inputClass}
                style={{ paddingLeft: "1rem", appearance: "none", backgroundColor: "var(--input-bg)", ...(fieldErrors.role ? inputErrorStyle : {}) }}
                defaultValue={worker?.role || "CASHIER"} 
              >
                <option value="CASHIER">Kasir (Cashier)</option>
                <option value="ADMIN">Admin Portal</option>
              </select>
              {fieldErrors.role && (
                <div style={fieldErrorStyle}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.role}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">
                Password {worker && <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "normal" }}>(Kosongkan jika tidak ingin mengubah)</span>}
              </label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                className={inputClass}
                style={{ paddingLeft: "1rem", ...(fieldErrors.password ? inputErrorStyle : {}) }}
                placeholder={worker ? "********" : "Masukkan kata sandi baru"}
              />
              {fieldErrors.password && (
                <div style={fieldErrorStyle}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.password}
                </div>
              )}
            </div>

          </div>

          <div style={{ padding: "1.5rem", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isLoading}
              style={{ background: "transparent", border: "1px solid var(--input-border)", color: "var(--foreground)", padding: "0.75rem 1.5rem", borderRadius: "0.75rem", cursor: "pointer", fontSize: "0.9375rem", fontWeight: 500 }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="py-3 px-8 bg-gradient-to-br from-[var(--primary)] to-[#7c3aed] border-none rounded-xl text-white text-[0.9375rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_var(--primary-glow)] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

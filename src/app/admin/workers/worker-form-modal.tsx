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

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ animation: "fadeInUp 0.3s ease-out", maxWidth: "450px" }}>
        <div className="modal-header">
          <h3>{worker ? "Edit Pengguna" : "Tambah Pengguna"}</h3>
          <button type="button" onClick={onClose} className="modal-close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && (
              <div className="error-banner" style={{ marginBottom: "0.5rem" }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="form-input" 
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

            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                className="form-input" 
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

            <div className="form-group">
              <label htmlFor="role" className="form-label">Peran (Role)</label>
              <select 
                id="role" 
                name="role" 
                className="form-input" 
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

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password {worker && <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "normal" }}>(Kosongkan jika tidak ingin mengubah)</span>}
              </label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                className="form-input" 
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
              className="submit-button" 
              disabled={isLoading}
              style={{ width: "auto", margin: 0, padding: "0.75rem 2rem" }}
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

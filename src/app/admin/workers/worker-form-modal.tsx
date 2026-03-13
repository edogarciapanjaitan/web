"use client";

import { useState } from "react";
import { WorkerData, createWorkerAction, updateWorkerAction } from "./workers-actions";

interface WorkerFormModalProps {
  worker?: WorkerData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WorkerFormModal({ worker, onClose, onSuccess }: WorkerFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Client-side validation for password field during creation
    const password = formData.get("password");
    if (!worker && (!password || (password as string).length < 6)) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }
    
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

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ animation: "fadeInUp 0.3s ease-out", maxWidth: "450px" }}>
        <div className="modal-header">
          <h3>{worker ? "Edit Pengguna" : "Tambah Pengguna"}</h3>
          <button type="button" onClick={onClose} className="modal-close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
                style={{ paddingLeft: "1rem" }}
                defaultValue={worker?.name || ""} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                className="form-input" 
                style={{ paddingLeft: "1rem" }}
                defaultValue={worker?.username || ""} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Peran (Role)</label>
              <select 
                id="role" 
                name="role" 
                className="form-input" 
                style={{ paddingLeft: "1rem", appearance: "none", backgroundColor: "var(--input-bg)" }}
                defaultValue={worker?.role || "CASHIER"} 
                required
              >
                <option value="CASHIER">Kasir (Cashier)</option>
                <option value="ADMIN">Admin Portal</option>
              </select>
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
                style={{ paddingLeft: "1rem" }}
                placeholder={worker ? "********" : "Masukkan kata sandi baru"}
                required={!worker} // Required only for new workers
              />
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

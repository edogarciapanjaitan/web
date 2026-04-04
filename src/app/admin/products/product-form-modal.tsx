"use client";

import { useState } from "react";
import { ProductData, createProductAction, updateProductAction } from "./products-actions";

interface ProductFormModalProps {
  product?: ProductData | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FieldErrors {
  name?: string;
  sku?: string;
  price?: string;
  stock?: string;
}

export default function ProductFormModal({ product, onClose, onSuccess }: ProductFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateForm = (formData: FormData): boolean => {
    const errors: FieldErrors = {};

    const name = (formData.get("name") as string)?.trim();
    const sku = (formData.get("sku") as string)?.trim();
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;

    if (!name) {
      errors.name = "Nama produk harus diisi";
    }
    if (!sku) {
      errors.sku = "SKU harus diisi";
    }
    if (!priceStr || priceStr === "" || Number(priceStr) <= 0) {
      errors.price = "Harga harus lebih dari 0";
    }
    if (!stockStr || stockStr === "" || Number(stockStr) <= 0) {
      errors.stock = "Stok awal harus lebih dari 0";
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
      if (product) {
        result = await updateProductAction(product.id, formData);
      } else {
        result = await createProductAction(formData);
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
      <div className="modal-content" style={{ animation: "fadeInUp 0.3s ease-out" }}>
        <div className="modal-header">
          <h3>{product ? "Edit Produk" : "Tambah Produk"}</h3>
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
              <label htmlFor="name" className="form-label">Nama Produk</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="form-input" 
                style={{ paddingLeft: "1rem", ...(fieldErrors.name ? inputErrorStyle : {}) }}
                defaultValue={product?.name || ""} 
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
              <label htmlFor="sku" className="form-label">SKU (Barcode)</label>
              <input 
                type="text" 
                id="sku" 
                name="sku" 
                className="form-input" 
                style={{ paddingLeft: "1rem", fontFamily: "monospace", ...(fieldErrors.sku ? inputErrorStyle : {}) }}
                defaultValue={product?.sku || ""} 
              />
              {fieldErrors.sku && (
                <div style={fieldErrorStyle}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.sku}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label htmlFor="price" className="form-label">Harga (Rp)</label>
                <input 
                  type="number" 
                  id="price" 
                  name="price" 
                  className="form-input" 
                  style={{ paddingLeft: "1rem", ...(fieldErrors.price ? inputErrorStyle : {}) }}
                  defaultValue={product?.price || ""} 
                  min="1"
                />
                {fieldErrors.price && (
                  <div style={fieldErrorStyle}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {fieldErrors.price}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="stock" className="form-label">Stok Awal</label>
                <input 
                  type="number" 
                  id="stock" 
                  name="stock" 
                  className="form-input" 
                  style={{ paddingLeft: "1rem", ...(fieldErrors.stock ? inputErrorStyle : {}) }}
                  defaultValue={product?.stock || ""} 
                  min="1"
                />
                {fieldErrors.stock && (
                  <div style={fieldErrorStyle}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {fieldErrors.stock}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">Kategori (Opsional)</label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                className="form-input" 
                style={{ paddingLeft: "1rem" }}
                defaultValue={product?.category || ""} 
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

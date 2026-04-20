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
    const priceStr = (formData.get("price") as string)?.trim();
    const stockStr = (formData.get("stock") as string)?.trim();

    if (!name) {
      errors.name = "Nama produk harus diisi";
    }
    if (!sku) {
      errors.sku = "SKU harus diisi";
    }
    if (!priceStr || priceStr === "" || Number(priceStr) <= 0) {
      errors.price = "Harga harus lebih dari 0";
    }
    if (!stockStr || stockStr === "" || Number(stockStr) < 0) {
      errors.stock = "Stok tidak boleh negatif";
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

    // Jika user tidak memilih file gambar (terutama saat edit),
    // hapus field 'image' dari formData agar tidak dikirim sebagai file kosong ke backend
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size === 0) {
      formData.delete("image");
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

  const inputClass = "w-full py-3 pr-3.5 pl-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)]";

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[4px] flex items-center justify-center z-[9999] p-6 animate-[fadeIn_0.2s_ease]">
      <div className="w-full max-w-[500px] bg-[rgba(18,18,28,0.98)] border border-[var(--card-border)] rounded-[1.25rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col max-h-[85vh] animate-[fadeInUp_0.3s_ease-out]">
        <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--card-border)]">
          <h3 className="text-[1.125rem] font-semibold m-0">{product ? "Edit Produk" : "Tambah Produk"}</h3>
          <button type="button" onClick={onClose} className="flex items-center justify-center w-8 h-8 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[var(--text-muted)] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.1)] hover:text-[var(--foreground)] text-lg">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto py-5 px-6 flex flex-col gap-4 min-h-0">
            {error && (
              <div className="flex items-center gap-2 py-3 px-4 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl text-[#fca5a5] text-[0.8125rem] animate-[fadeIn_0.3s_ease] mb-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">Nama Produk</label>
              <input
                type="text"
                id="name"
                name="name"
                className={inputClass}
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sku" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">SKU (Barcode)</label>
              <input
                type="text"
                id="sku"
                name="sku"
                className={inputClass}
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
              <div className="flex flex-col gap-1.5">
                <label htmlFor="price" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">Harga (Rp)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className={inputClass}
                  style={{ paddingLeft: "1rem", ...(fieldErrors.price ? inputErrorStyle : {}) }}
                  defaultValue={product?.price ?? ""}
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

              <div className="flex flex-col gap-1.5">
                <label htmlFor="stock" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">Stok Awal</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  className={inputClass}
                  style={{ paddingLeft: "1rem", ...(fieldErrors.stock ? inputErrorStyle : {}) }}
                  defaultValue={product?.stock ?? ""}
                  min="0"
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">Kategori (Opsional)</label>
              <input
                type="text"
                id="category"
                name="category"
                className={inputClass}
                style={{ paddingLeft: "1rem" }}
                defaultValue={product?.category || ""}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="image" className="text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-[0.01em]">Gambar Produk (Opsional)</label>
              {product?.imageUrl && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={product.imageUrl} alt="Current" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                className={inputClass}
                style={{ padding: "0.5rem 1rem" }}
              />
            </div>
          </div>

          <div style={{ padding: "1.5rem", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "flex-end", gap: "1rem", flexShrink: 0 }}>
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

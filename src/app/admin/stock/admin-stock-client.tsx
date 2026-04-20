"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adjustStockAction, type StockAdjustmentData } from "./stock-actions";

interface AdminStockClientProps {
  initialData: StockAdjustmentData[];
  initialMeta: { total: number; pages: number; currentPage: number };
  initialSearch: string;
}

export default function AdminStockClient({ initialData, initialMeta, initialSearch }: AdminStockClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [deltaValue, setDeltaValue] = useState<string>("");
  const [error, setError] = useState<{ id: string, msg: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== initialSearch) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (searchTerm) {
            params.set('search', searchTerm);
          } else {
            params.delete('search');
          }
          params.set('page', '1');
          router.push(`/admin/stock?${params.toString()}`);
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, initialSearch, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/admin/stock?${params.toString()}`);
    });
  };

  const handleAdjustClick = (item: StockAdjustmentData) => {
    setAdjustingId(item.id);
    setDeltaValue("");
    setError(null);
    setSuccessMsg(null);
  };

  const handleCancelAdjust = () => {
    setAdjustingId(null);
    setDeltaValue("");
    setError(null);
  };

  const handleSubmitAdjust = async (id: string, currentStock: number) => {
    const delta = parseInt(deltaValue, 10);
    
    if (isNaN(delta) || delta === 0) {
      setError({ id, msg: "Masukkan angka valid (+ atau -)" });
      return;
    }

    if (currentStock + delta < 0) {
      setError({ id, msg: `Stok tidak bisa negatif. (Maksimal kurangi ${currentStock})` });
      return;
    }

    startTransition(async () => {
      const res = await adjustStockAction(id, delta);
      if (!res.success) {
        setError({ id, msg: res.message });
      } else {
        setAdjustingId(null);
        setError(null);
        setSuccessMsg(`Stok berhasil diperbarui: ${delta > 0 ? '+' : ''}${delta}`);
        
        // Hide success message after 3 seconds
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push("/admin/stock");
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 py-3 px-4 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-xl text-[#86efac] text-[0.8125rem] animate-[fadeIn_0.3s_ease] mb-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-[rgba(30,41,59,0.4)] backdrop-blur-[12px] border border-[var(--card-border)] rounded-xl py-4 px-6">
        <div style={{ flex: 1, position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            className="w-full py-3 pr-3.5 pl-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)]"
            placeholder="Cari nama produk / SKU barang masuk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%', maxWidth: '400px' }}
          />
          {isPending && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memuat...</span>}
        </div>

        {searchTerm && (
          <button
            onClick={handleReset}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-4">
        {initialData.length === 0 ? (
           <div className="py-12 text-center text-[var(--text-muted)] text-sm">
             <p>Tidak ada produk ditemukan.</p>
           </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--card-border)]">
            <table className="w-full border-collapse text-sm [&_th]:py-3 [&_th]:px-4 [&_th]:text-left [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-[var(--text-muted)] [&_th]:font-semibold [&_th]:bg-[rgba(255,255,255,0.03)] [&_th]:border-b [&_th]:border-[var(--card-border)] [&_td]:py-3 [&_td]:px-4 [&_td]:border-b [&_td]:border-[rgba(255,255,255,0.04)] [&_tr:last-child_td]:border-b-0 [&_tr:hover_td]:bg-[rgba(255,255,255,0.02)]">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nama Produk</th>
                  <th style={{ textAlign: "center" }}>Sisa Stok Saat Ini</th>
                  <th style={{ textAlign: "center", width: "35%" }}>Penyesuaian Stok Cepat</th>
                </tr>
              </thead>
              <tbody>
                {initialData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--text-secondary)" }}>{item.sku}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ 
                              background: item.stock === 0 ? 'rgba(239, 68, 68, 0.2)' : item.stock <= 5 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: item.stock === 0 ? '#fca5a5' : item.stock <= 5 ? '#fcd34d' : '#6ee7b7',
                              padding: '4px 12px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600
                            }}>
                        {item.stock} Unit
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {adjustingId === item.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input 
                              type="number" 
                              value={deltaValue}
                              onChange={(e) => setDeltaValue(e.target.value)}
                              placeholder="+10 atau -5"
                              className="w-full py-3 pr-3.5 pl-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)]"
                              style={{ width: "130px", padding: "0.5rem 0.75rem", textAlign: "center" }}
                              autoFocus
                            />
                            <button 
                              onClick={() => handleSubmitAdjust(item.id, item.stock)}
                              disabled={isPending}
                              style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Simpan
                            </button>
                            <button 
                              onClick={handleCancelAdjust}
                              disabled={isPending}
                              style={{ padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--input-border)', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              X
                            </button>
                          </div>
                          {error && error.id === item.id && (
                            <span style={{ color: "#fca5a5", fontSize: "0.75rem" }}>{error.msg}</span>
                          )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAdjustClick(item)}
                          style={{ padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--foreground)', border: '1px solid var(--card-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Sesuaikan Stok
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {initialMeta.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
          <button 
            disabled={initialMeta.currentPage <= 1 || isPending}
            onClick={() => handlePageChange(initialMeta.currentPage - 1)}
            style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '6px', cursor: initialMeta.currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: initialMeta.currentPage <= 1 ? 0.5 : 1 }}
          >
            Sebelumnya
          </button>
          
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Halaman {initialMeta.currentPage} dari {initialMeta.pages}
          </span>

          <button 
            disabled={initialMeta.currentPage >= initialMeta.pages || isPending}
            onClick={() => handlePageChange(initialMeta.currentPage + 1)}
            style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '6px', cursor: initialMeta.currentPage >= initialMeta.pages ? 'not-allowed' : 'pointer', opacity: initialMeta.currentPage >= initialMeta.pages ? 0.5 : 1 }}
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}

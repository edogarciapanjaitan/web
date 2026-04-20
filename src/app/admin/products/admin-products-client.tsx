"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductData, deleteProductAction } from "./products-actions";
import ProductFormModal from "./product-form-modal";

interface AdminProductsClientProps {
  initialData: ProductData[];
  initialMeta: { total: number; pages: number; currentPage: number };
  initialSearch: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminProductsClient({ initialData, initialMeta, initialSearch }: AdminProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);

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
          router.push(`/admin/products?${params.toString()}`);
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, initialSearch, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: ProductData) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      const res = await deleteProductAction(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleReset = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push("/admin/products");
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-[rgba(30,41,59,0.4)] backdrop-blur-md border border-(--card-border)] rounded-xl py-4 px-6">
        <div style={{ flex: 1, position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            className="w-full py-3 pr-3.5 pl-4 bg-(--input-bg)] border border-(--input-border)] rounded-xl text-(--foreground)] text-[0.9375rem] font-[inherit] outline-none transition-all duration-200 placeholder:text-(--text-muted)] hover:border-[rgba(255,255,255,0.2)] focus:border-(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] focus:bg-[rgba(255,255,255,0.08)]"
            placeholder="Cari nama produk atau SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%', maxWidth: '400px' }}
          />
          {isPending && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memuat...</span>}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
          <button onClick={handleAdd} className="py-[0.6rem] px-[1.2rem] bg-linear-to-br from-(--primary)] to-[#7c3aed] border-none rounded-lg text-white text-[0.9375rem] font-semibold font-[inherit] cursor-pointer transition-all duration-200 flex items-center gap-2 hover:-translate-y-px hover:shadow-[0_8px_24px_var(--primary-glow)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            </svg>
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        {initialData.length === 0 ? (
           <div className="py-12 text-center text-(--text-muted)] text-sm">
             <p>Tidak ada produk ditemukan.</p>
           </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-(--card-border)]">
            <table className="w-full border-collapse text-sm [&_th]:py-3 [&_th]:px-4 [&_th]:text-left [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-(--text-muted)] [&_th]:font-semibold [&_th]:bg-[rgba(255,255,255,0.03)] [&_th]:border-b [&_th]:border-(--card-border)] [&_td]:py-3 [&_td]:px-4 [&_td]:border-b [&_td]:border-[rgba(255,255,255,0.04)] [&_tr:last-child_td]:border-b-0 [&_tr:hover_td]:bg-[rgba(255,255,255,0.02)]">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Gambar</th>
                  <th>SKU</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th style={{ textAlign: "right" }}>Harga</th>
                  <th style={{ textAlign: "right" }}>Stok</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {initialData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: 'var(--card-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>No Img</div>
                      )}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--text-secondary)" }}>{item.sku}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.category || "-"}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ 
                              background: item.stock === 0 ? 'rgba(239, 68, 68, 0.2)' : item.stock <= 5 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: item.stock === 0 ? '#fca5a5' : item.stock <= 5 ? '#fcd34d' : '#6ee7b7',
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
                            }}>
                        {item.stock}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                      <button 
                        onClick={() => handleEdit(item)}
                        style={{ padding: '0.25rem 0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, item.name)}
                        style={{ padding: '0.25rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Hapus
                      </button>
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <ProductFormModal 
          product={selectedProduct} 
          onClose={handleModalClose} 
          onSuccess={handleModalSuccess} 
        />
      )}
    </div>
  );
}

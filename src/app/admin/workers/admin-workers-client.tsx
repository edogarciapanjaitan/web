"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkerData, deleteWorkerAction } from "./workers-actions";
import WorkerFormModal from "./worker-form-modal";

interface AdminWorkersClientProps {
  initialData: WorkerData[];
  initialMeta: { total: number; pages: number; currentPage: number };
  initialSearch: string;
}

export default function AdminWorkersClient({ initialData, initialMeta, initialSearch }: AdminWorkersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(null);

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
          router.push(`/admin/workers?${params.toString()}`);
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, initialSearch, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/admin/workers?${params.toString()}`);
    });
  };

  const handleAdd = () => {
    setSelectedWorker(null);
    setIsModalOpen(true);
  };

  const handleEdit = (worker: WorkerData) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?\nPerhatian: Kasir yang sudah memiliki transaksi tidak dapat dihapus.`)) {
      const res = await deleteWorkerAction(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedWorker(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setSelectedWorker(null);
  };

  const handleReset = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push("/admin/workers");
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Toolbar */}
      <div className="history-toolbar">
        <div className="search-box" style={{ flex: 1, position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            className="form-input"
            placeholder="Cari nama atau username..."
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
          <button onClick={handleAdd} className="submit-button" style={{ width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
            </svg>
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="history-list-wrapper mt-4">
        {initialData.length === 0 ? (
           <div className="history-empty-state">
             <p>Tidak ada pengguna ditemukan.</p>
           </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Nama Lengkap</th>
                  <th>Username</th>
                  <th>Peran (Role)</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {initialData.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>@{item.username}</td>
                    <td>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: item.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: item.role === 'ADMIN' ? '#818cf8' : '#6ee7b7'
                      }}>
                        {item.role === 'ADMIN' ? 'Admin Portal' : 'Kasir'}
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
        <WorkerFormModal 
          worker={selectedWorker} 
          onClose={handleModalClose} 
          onSuccess={handleModalSuccess} 
        />
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { fetchStockProducts } from "./stock-actions";
import AdminStockClient from "./admin-stock-client";

export const metadata: Metadata = {
  title: "Penyesuaian Stok — Admin Portal",
  description: "Kelola kuantitas inventaris baran",
};

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sParams = await searchParams;
  const page = typeof sParams.page === "string" ? parseInt(sParams.page) : 1;
  const search = typeof sParams.search === "string" ? sParams.search : "";

  // SSR Data Fetching
  const result = await fetchStockProducts(page, search);
  
  // Safe default assignments to handle API fetch failures
  const products = result?.data || [];
  const meta = result?.meta || { total: 0, pages: 0, currentPage: 1 };

  return (
    <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>Penyesuaian Stok Cepat</h2>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9375rem" }}>
          Gunakan halaman ini untuk mendaftarkan barang yang baru masuk dari supplier atau barang yang rusak. Masukkan angka positif untuk menambah stok (contoh: <span style={{ fontFamily: "monospace", color: "#4ade80" }}>10</span>), dan negatif untuk mengurangi (contoh: <span style={{ fontFamily: "monospace", color: "#f87171" }}>-5</span>).
        </p>
      </div>

      <AdminStockClient 
        initialData={products} 
        initialMeta={meta} 
        initialSearch={search}
      />
    </div>
  );
}

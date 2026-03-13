import type { Metadata } from "next";
import { getAdminProducts } from "./products-actions";
import AdminProductsClient from "./admin-products-client";

export const metadata: Metadata = {
  title: "Manajemen Produk — Admin Portal",
  description: "Kelola data produk Cashier App",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sParams = await searchParams;
  const page = typeof sParams.page === "string" ? parseInt(sParams.page) : 1;
  const search = typeof sParams.search === "string" ? sParams.search : "";

  // SSR Data Fetching
  const result = await getAdminProducts(page, search);
  
  // Safe default assignments to handle API fetch failures
  const products = result?.data || [];
  const meta = result?.meta || { total: 0, pages: 0, currentPage: 1 };

  return (
    <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>Rekap Data Produk</h2>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9375rem" }}>
          Berikut adalah daftar barang yang dijual dalam sistem inventaris. Anda dapat mencari, mengubah, menambah, atau menghapus data produk di bawah ini.
        </p>
      </div>

      {/* Render Client Wrapper for Interactivity (Search, Sorting, Form) */}
      <AdminProductsClient 
        initialData={products} 
        initialMeta={meta} 
        initialSearch={search}
      />
    </div>
  );
}

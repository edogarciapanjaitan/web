import type { Metadata } from "next";
import { getAdminWorkers } from "./workers-actions";
import AdminWorkersClient from "./admin-workers-client";

export const metadata: Metadata = {
  title: "Manajemen Pekerja — Admin Portal",
  description: "Kelola akun kasir dan admin",
};

export default async function AdminWorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sParams = await searchParams;
  const page = typeof sParams.page === "string" ? parseInt(sParams.page) : 1;
  const search = typeof sParams.search === "string" ? sParams.search : "";

  // SSR Data Fetching
  const result = await getAdminWorkers(page, search);
  
  // Safe default assignments to handle API fetch failures
  const workers = result?.data || [];
  const meta = result?.meta || { total: 0, pages: 0, currentPage: 1 };

  return (
    <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>Manajemen Pekerja &amp; Akses</h2>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9375rem" }}>
          Kelola akun yang memiliki hak akses untuk masuk ke dalam sistem Cashier App. Anda dapat mendaftarkan akun kasir baru atau mengubah sandi pekerja di sini.
        </p>
      </div>

      <AdminWorkersClient 
        initialData={workers} 
        initialMeta={meta} 
        initialSearch={search}
      />
    </div>
  );
}

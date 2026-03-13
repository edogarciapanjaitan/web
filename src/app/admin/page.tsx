import { getDashboardStatsAction } from "./dashboard-actions";
import DashboardChart from "./dashboard-chart";

export default async function AdminPage() {
  const statsRes = await getDashboardStatsAction(7);
  const dashboardStats = statsRes.success ? statsRes.data : [];

  return (
    <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
      <div className="dashboard-greeting">
        <h2>Selamat Datang di Portal Admin ⚙️</h2>
        <p>Gunakan panel di sebelah kiri untuk mengelola aspek krusial sistem kasir.</p>
      </div>

      {dashboardStats.length > 0 ? (
        <DashboardChart data={dashboardStats} />
      ) : (
        <div style={{
          padding: "2.5rem",
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "1rem",
          textAlign: "center",
          color: "var(--text-muted)",
        }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ margin: "0 auto 1rem", opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p style={{ margin: 0, fontSize: "0.9375rem" }}>Belum ada data penjualan untuk ditampilkan.</p>
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8125rem", opacity: 0.7 }}>Data akan muncul setelah transaksi pertama diproses.</p>
        </div>
      )}
    </div>
  );
}

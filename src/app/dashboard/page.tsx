import { cookies } from "next/headers";
import type { Metadata } from "next";
import LogoutButton from "./logout-button";
import ShiftPanel from "./shift-panel";
import { fetchActiveShift } from "./shift-actions";
import { NavConfirmLink } from "./toast";

export const metadata: Metadata = {
  title: "Dashboard — Cashier App",
  description: "Panel utama aplikasi kasir",
};

interface UserInfo {
  id: string;
  name: string;
  username: string;
  role: string;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get("user-info")?.value;

  let user: UserInfo | null = null;
  try {
    user = userInfoCookie ? JSON.parse(userInfoCookie) : null;
  } catch {
    user = null;
  }

  // SSR: Fetch active shift data from API
  const activeShift = await fetchActiveShift();

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 2H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 4H7V4h10v2zM17 9H7c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm-5 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
              fill="currentColor"
            />
          </svg>
          <h1>Cashier App</h1>
        </div>
        <div className="dashboard-user">
          {user && (
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role}</p>
            </div>
          )}
          <LogoutButton />
        </div>
      </header>

      {/* Content — Shift Gate or Dashboard */}
      {!activeShift ? (
        // NO ACTIVE SHIFT: Full-page shift gate
        <main className="shift-gate">
          <ShiftPanel initialShift={null} />
        </main>
      ) : (
        // ACTIVE SHIFT: Normal dashboard
        <main className="dashboard-content">
          <div className="dashboard-main">
            <div className="dashboard-greeting">
              <h2>Selamat Datang{user ? `, ${user.name}` : ""}! 👋</h2>
              <p>Kelola shift dan transaksi Anda di sini.</p>
            </div>

            {/* Shift Panel — show active shift info + end shift form */}
            <ShiftPanel initialShift={activeShift} />

            {/* Actions Container */}
            <div className="dashboard-actions-grid mt-6">
              {/* POS Link with confirmation */}
              <NavConfirmLink
                href="/dashboard/pos"
                message="Anda akan masuk ke halaman Point of Sale. Lanjutkan?"
                className="pos-launch-link"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                </svg>
                <div className="pos-launch-text">
                  <span className="pos-launch-title">Mulai Transaksi</span>
                  <span className="pos-launch-desc">Buka halaman Point of Sale</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                </svg>
              </NavConfirmLink>

              {/* History Link with confirmation */}
              <NavConfirmLink
                href="/dashboard/history"
                message="Anda akan masuk ke halaman Riwayat Transaksi. Lanjutkan?"
                className="pos-launch-link history-launch-link"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
                </svg>
                <div className="pos-launch-text">
                  <span className="pos-launch-title">Riwayat Transaksi</span>
                  <span className="pos-launch-desc">Lihat detail transaksi harian</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                </svg>
              </NavConfirmLink>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

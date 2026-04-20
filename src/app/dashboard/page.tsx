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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-[var(--card-bg)] border-b border-[var(--card-border)] backdrop-blur-[12px]">
        <div className="flex items-center gap-3">
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
          <h1 className="text-[1.125rem] font-semibold m-0">Cashier App</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium m-0">{user.name}</p>
              <p className="text-xs text-[var(--text-muted)] m-0 uppercase tracking-[0.05em]">{user.role}</p>
            </div>
          )}
          <LogoutButton />
        </div>
      </header>

      {/* Content — Shift Gate or Dashboard */}
      {!activeShift ? (
        // NO ACTIVE SHIFT: Full-page shift gate
        <main className="flex-1 flex items-center justify-center p-8">
          <ShiftPanel initialShift={null} />
        </main>
      ) : (
        // ACTIVE SHIFT: Normal dashboard
        <main className="flex-1 flex justify-center p-8">
          <div className="w-full max-w-[560px]">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold m-0 mb-1.5">Selamat Datang{user ? `, ${user.name}` : ""}! 👋</h2>
              <p className="text-[var(--text-muted)] m-0 text-[0.9375rem]">Kelola shift dan transaksi Anda di sini.</p>
            </div>

            {/* Shift Panel — show active shift info + end shift form */}
            <ShiftPanel initialShift={activeShift} />

            {/* Actions Container */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-6">
              {/* POS Link with confirmation */}
              <NavConfirmLink
                href="/dashboard/pos"
                message="Anda akan masuk ke halaman Point of Sale. Lanjutkan?"
                className="flex items-center gap-4 py-4 px-5 mt-4 bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(139,92,246,0.08)] border border-[rgba(99,102,241,0.2)] rounded-2xl text-[var(--foreground)] no-underline transition-all duration-200 animate-[fadeInUp_0.5s_ease-out_0.2s_both] hover:bg-gradient-to-br hover:from-[rgba(99,102,241,0.18)] hover:to-[rgba(139,92,246,0.14)] hover:border-[rgba(99,102,241,0.35)] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(99,102,241,0.15)]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                </svg>
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="font-semibold text-[0.9375rem]">Mulai Transaksi</span>
                  <span className="text-xs text-[var(--text-muted)]">Buka halaman Point of Sale</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                </svg>
              </NavConfirmLink>

              {/* History Link with confirmation */}
              <NavConfirmLink
                href="/dashboard/history"
                message="Anda akan masuk ke halaman Riwayat Transaksi. Lanjutkan?"
                className="flex items-center gap-4 py-4 px-5 mt-4 bg-gradient-to-br from-[rgba(59,130,246,0.15)] to-[rgba(37,99,235,0.1)] border border-[rgba(59,130,246,0.2)] rounded-2xl text-[var(--foreground)] no-underline transition-all duration-200 animate-[fadeInUp_0.5s_ease-out_0.2s_both] hover:bg-gradient-to-br hover:from-[rgba(59,130,246,0.25)] hover:to-[rgba(37,99,235,0.2)] hover:border-[rgba(59,130,246,0.4)] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(59,130,246,0.15)]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
                </svg>
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="font-semibold text-[0.9375rem] text-[#60a5fa]">Riwayat Transaksi</span>
                  <span className="text-xs text-[var(--text-muted)]">Lihat detail transaksi harian</span>
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

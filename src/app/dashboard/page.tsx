import { cookies } from "next/headers";
import type { Metadata } from "next";
import LogoutButton from "./logout-button";
import ShiftPanel from "./shift-panel";
import { fetchActiveShift } from "./shift-actions";

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

      {/* Content */}
      <main className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-greeting">
            <h2>Selamat Datang{user ? `, ${user.name}` : ""}! 👋</h2>
            <p>Kelola shift dan transaksi Anda di sini.</p>
          </div>

          {/* Shift Panel — Client Component hydrated with SSR data */}
          <ShiftPanel initialShift={activeShift} />
        </div>
      </main>
    </div>
  );
}

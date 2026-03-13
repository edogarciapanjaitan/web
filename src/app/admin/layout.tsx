import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "./sidebar";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal — Cashier App",
  description: "Panel administrasi aplikasi kasir",
};

interface UserInfo {
  id: string;
  name: string;
  username: string;
  role: string;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const role = cookieStore.get("role")?.value;
  const userInfoCookie = cookieStore.get("user-info")?.value;

  // Security: Prevent unauthenticated access or Non-Admin access
  if (!token || role !== "ADMIN") {
    redirect("/login");
  }

  let user: UserInfo | null = null;
  try {
    user = userInfoCookie ? JSON.parse(userInfoCookie) : null;
  } catch {
    user = null;
  }

  return (
    <div className="admin-layout">
      {/* Dynamic Sidebar Client Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-main-header">
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Portal Administrasi</h2>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          
          {user && (
            <div className="dashboard-user">
              <div className="user-info">
                <p className="user-name">{user.name}</p>
                <p className="user-role">{user.role}</p>
              </div>
            </div>
          )}
        </header>

        {/* Dynamic Page Content */}
        <main className="admin-content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
}

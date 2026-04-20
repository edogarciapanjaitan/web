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
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Dynamic Sidebar Client Component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-[var(--card-border)] bg-[rgba(255,255,255,0.02)] backdrop-blur-[8px]">
          <div>
            <h2 className="m-0 text-[1.25rem] font-semibold">Portal Administrasi</h2>
            <p className="m-0 text-sm text-[var(--text-muted)]">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium m-0">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)] m-0 uppercase tracking-[0.05em]">{user.role}</p>
              </div>
            </div>
          )}
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

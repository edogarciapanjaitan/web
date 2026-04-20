"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "../dashboard/actions";

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "Produk",
      href: "/admin/products",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zm-8-2h2v-4h4v-2h-4V7h-2v4H8v2h4v4z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "Stok",
      href: "/admin/stock",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "Pekerja",
      href: "/admin/workers",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
        </svg>
      )
    }
  ];

  return (
    <aside className="w-55 bg-[rgba(255,255,255,0.02)] border-r border-(--card-border)] flex flex-col min-h-screen">
      {/* Brand */}
      <div className="flex items-center gap-2.5 py-5 px-5 border-b border-(--card-border)]">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-(--primary)] to-[#8b5cf6] flex items-center justify-center text-white shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-semibold text-sm text-(--foreground)]">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 py-4 px-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm font-medium no-underline transition-all duration-150 ${isActive ? "bg-[rgba(99,102,241,0.12)] text-(--primary-hover)] border border-[rgba(99,102,241,0.2)]" : "text-(--text-secondary)] border border-transparent hover:bg-[rgba(255,255,255,0.04)] hover:text-(--foreground)]"}`}
            >
              <span className="shrink-0 opacity-80">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="py-4 px-3 border-t border-(--card-border)]">
        <button onClick={handleLogout} className="flex items-center gap-2 w-full py-2.5 px-3 rounded-lg text-sm font-medium text-(--text-muted)] bg-transparent border border-transparent font-[inherit] cursor-pointer transition-all duration-150 hover:bg-[rgba(239,68,68,0.08)] hover:text-[#fca5a5] hover:border-[rgba(239,68,68,0.15)]">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

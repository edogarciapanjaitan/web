import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchActiveShift } from "../shift-actions";
import { fetchShiftTransactions } from "./pos-actions";
import PosClient from "./pos-client";
import { NavConfirmLink } from "../toast";

export const metadata: Metadata = {
  title: "POS — Cashier App",
  description: "Point of Sale — proses transaksi penjualan",
};

export default async function PosPage() {
  const shift = await fetchActiveShift();

  // No active shift → redirect back to dashboard
  if (!shift) {
    redirect("/dashboard");
  }

  // Fetch existing transactions for this shift (SSR)
  const transactions = await fetchShiftTransactions(shift.id);

  return (
    <div className="min-h-screen flex flex-col py-6 px-8 max-w-[1400px] mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <NavConfirmLink
          href="/dashboard"
          message="Anda akan keluar dari halaman POS dan kembali ke Dashboard. Lanjutkan?"
          className="flex items-center gap-1.5 text-[var(--text-secondary)] no-underline text-sm font-medium py-1.5 px-3 rounded-lg transition-all duration-200 hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.06)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
          Dashboard
        </NavConfirmLink>
        <h2 className="text-[1.25rem] font-semibold m-0">Point of Sale</h2>
      </div>

      <PosClient shift={shift} initialTransactions={transactions} />
    </div>
  );
}

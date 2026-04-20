import { Metadata } from "next";
import { fetchDailyHistory } from "./history-actions";
import HistoryClient from "@/app/dashboard/history/history-client";
import { NavConfirmLink } from "../toast";

export const metadata: Metadata = {
  title: "Riwayat Transaksi — Cashier App",
  description: "Melihat riwayat transaksi harian",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const now = new Date();
  const dateStr = resolvedSearchParams?.date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Fetch data cleanly on the server (SSR)
  const historyResponse = await fetchDailyHistory(dateStr);

  return (
    <div className="min-h-screen flex flex-col py-6 px-8 max-w-[1400px] mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <NavConfirmLink
          href="/dashboard"
          message="Anda akan keluar dari halaman Riwayat Transaksi dan kembali ke Dashboard. Lanjutkan?"
          className="flex items-center gap-1.5 text-[var(--text-secondary)] no-underline text-sm font-medium py-1.5 px-3 rounded-lg transition-all duration-200 hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.06)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
          </svg>
          Dashboard
        </NavConfirmLink>
        <h2 className="text-[1.25rem] font-semibold m-0">Riwayat Transaksi Harian</h2>
      </div>

      {/* Pass fetched data to the client component for interactivity */}
      <HistoryClient
        initialDate={dateStr}
        initialData={historyResponse.data || []}
        error={historyResponse.message}
      />
    </div>
  );
}

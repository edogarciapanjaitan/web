import { Metadata } from "next";
import { fetchDailyHistory } from "./history-actions";
import HistoryClient from "@/app/dashboard/history/history-client";

export const metadata: Metadata = {
  title: "Riwayat Transaksi — Cashier App",
  description: "Melihat riwayat transaksi harian",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const dateStr = resolvedSearchParams?.date || new Date().toISOString().split("T")[0];

  // Fetch data cleanly on the server (SSR)
  const historyResponse = await fetchDailyHistory(dateStr);

  return (
    <div className="pos-page">
      <div className="pos-header">
        <a href="/dashboard" className="pos-back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
          </svg>
          Dashboard
        </a>
        <h2 className="pos-title">Riwayat Transaksi Harian</h2>
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

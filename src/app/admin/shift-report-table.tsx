"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { ShiftReport } from "./dashboard-actions";

interface ShiftReportTableProps {
  reports: ShiftReport[];
  initialSearch: string;
  initialFilter: string;
  initialPage: number;
}

const ITEMS_PER_PAGE = 5;

type FilterType = "all" | "discrepancy";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatSignedCurrency(amount: number): string {
  const prefix = amount > 0 ? "+" : "";
  return prefix + formatCurrency(amount);
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate discrepancy status for a shift.
 * Expected cash = startingCash + totalCashSales (debit goes to bank, not register)
 */
function getDiscrepancyInfo(report: ShiftReport) {
  if (report.endingCash === null || report.endTime === null) {
    return { status: "open" as const, expectedCash: null, discrepancy: null };
  }

  const expectedCash = report.startingCash + report.totalCashSales;
  const discrepancy = report.endingCash - expectedCash;

  return {
    status: discrepancy === 0 ? ("match" as const) : ("mismatch" as const),
    expectedCash,
    discrepancy,
  };
}

export default function ShiftReportTable({ reports, initialSearch, initialFilter, initialPage }: ShiftReportTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const filter = (initialFilter === "discrepancy" ? "discrepancy" : "all") as FilterType;
  const currentPage = Math.max(1, initialPage || 1);

  // Check if any filter is active
  const hasActiveFilter = searchTerm !== "" || filter !== "all";

  const updateURL = (newSearch: string, newFilter: string, newPage?: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSearch) {
        params.set("shiftSearch", newSearch);
      } else {
        params.delete("shiftSearch");
      }
      if (newFilter !== "all") {
        params.set("shiftFilter", newFilter);
      } else {
        params.delete("shiftFilter");
      }
      if (newPage && newPage > 1) {
        params.set("shiftPage", newPage.toString());
      } else {
        params.delete("shiftPage");
      }
      router.push(`/admin?${params.toString()}`);
    });
  };

  const setFilter = (newFilter: FilterType) => {
    updateURL(searchTerm, newFilter, 1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    clearTimeout((globalThis as any).__shiftSearchTimer);
    (globalThis as any).__shiftSearchTimer = setTimeout(() => {
      updateURL(value, filter, 1);
    }, 500);
  };

  const handleReset = () => {
    setSearchTerm("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("shiftSearch");
      params.delete("shiftFilter");
      params.delete("shiftPage");
      router.push(`/admin?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    updateURL(searchTerm, filter, newPage);
  };

  // Count discrepancies for badge
  const discrepancyCount = reports.filter((r) => {
    const info = getDiscrepancyInfo(r);
    return info.status === "mismatch";
  }).length;

  const filteredReports = reports.filter((report) => {
    // Search filter
    const matchesSearch =
      report.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDateTime(report.startTime).toLowerCase().includes(searchTerm.toLowerCase());

    // Discrepancy filter
    if (filter === "discrepancy") {
      const info = getDiscrepancyInfo(report);
      return matchesSearch && info.status === "mismatch";
    }

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedReports = filteredReports.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "1.5rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.25rem 0" }}>
            Laporan Kinerja Shift
          </h3>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.875rem" }}>
            Ringkasan transaksi, pendapatan, dan kesesuaian kas per shift
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Filter Toggle */}
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              background: "var(--bg-body)",
              padding: "0.25rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={() => setFilter("all")}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                border: "none",
                background: filter === "all" ? "var(--bg-card)" : "transparent",
                color: filter === "all" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: filter === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("discrepancy")}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                border: "none",
                background: filter === "discrepancy" ? "var(--bg-card)" : "transparent",
                color: filter === "discrepancy" ? "#ef4444" : "var(--text-secondary)",
                boxShadow: filter === "discrepancy" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              Tidak Sesuai
              {discrepancyCount > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: "9999px",
                    lineHeight: "1.4",
                  }}
                >
                  {discrepancyCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative", width: "220px" }}>
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="form-input"
              placeholder="Cari kasir atau tanggal..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ paddingLeft: "36px", width: "100%", fontSize: "0.875rem" }}
            />
          </div>

          {/* Reset Button */}
          {hasActiveFilter && (
            <button
              onClick={handleReset}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                border: "1px solid rgba(239, 68, 68, 0.3)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#fca5a5",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                whiteSpace: "nowrap",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="history-table-container">
        {filteredReports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            {filter === "discrepancy"
              ? "Tidak ada shift dengan selisih kas. Semua data sesuai! 🎉"
              : "Tidak ada data laporan shift yang ditemukan."}
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Waktu Shift</th>
                <th>Kasir</th>
                <th style={{ textAlign: "center" }}>Jml. Transaksi</th>
                <th style={{ textAlign: "right" }}>Uang Awal</th>
                <th style={{ textAlign: "right" }}>Tunai Terekam</th>
                <th style={{ textAlign: "right" }}>Debit Terekam</th>
                <th style={{ textAlign: "right" }}>Kas Diharapkan</th>
                <th style={{ textAlign: "right" }}>Total Akhir Laci</th>
                <th style={{ textAlign: "right" }}>Selisih</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((report) => {
                const info = getDiscrepancyInfo(report);

                return (
                  <tr
                    key={report.id}
                    style={{
                      background:
                        info.status === "mismatch"
                          ? "rgba(239, 68, 68, 0.06)"
                          : undefined,
                      transition: "background 0.2s",
                    }}
                  >
                    {/* Waktu Shift */}
                    <td>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                        {new Date(report.startTime).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginTop: "0.125rem",
                        }}
                      >
                        {formatTime(report.startTime)} -{" "}
                        {report.endTime ? formatTime(report.endTime) : "Aktif"}
                      </div>
                    </td>

                    {/* Kasir */}
                    <td>
                      <span style={{ fontWeight: 500 }}>{report.cashierName}</span>
                    </td>

                    {/* Jml. Transaksi */}
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          background: "rgba(99, 102, 241, 0.15)",
                          color: "#818cf8",
                          padding: "2px 8px",
                          borderRadius: "1rem",
                          fontWeight: 600,
                          fontSize: "0.8125rem",
                        }}
                      >
                        {report.totalTransactions}
                      </span>
                    </td>

                    {/* Uang Awal */}
                    <td style={{ textAlign: "right", fontSize: "0.875rem" }}>
                      {formatCurrency(report.startingCash)}
                    </td>

                    {/* Tunai Terekam */}
                    <td style={{ textAlign: "right", fontSize: "0.875rem" }}>
                      {formatCurrency(report.totalCashSales)}
                    </td>

                    {/* Debit Terekam */}
                    <td style={{ textAlign: "right", fontSize: "0.875rem" }}>
                      {formatCurrency(report.totalDebitSales)}
                    </td>

                    {/* Kas Diharapkan */}
                    <td
                      style={{
                        textAlign: "right",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {info.expectedCash !== null
                        ? formatCurrency(info.expectedCash)
                        : "-"}
                    </td>

                    {/* Total Akhir Laci */}
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color:
                          info.status === "mismatch"
                            ? "#ef4444"
                            : info.status === "match"
                            ? "var(--success)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {report.endingCash !== null
                        ? formatCurrency(report.endingCash)
                        : "-"}
                    </td>

                    {/* Selisih */}
                    <td
                      style={{
                        textAlign: "right",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color:
                          info.status === "mismatch"
                            ? "#ef4444"
                            : info.status === "match"
                            ? "var(--success)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {info.discrepancy !== null
                        ? info.discrepancy === 0
                          ? formatCurrency(0)
                          : formatSignedCurrency(info.discrepancy)
                        : "-"}
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: "center" }}>
                      {info.status === "match" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            background: "rgba(34, 197, 94, 0.12)",
                            color: "#22c55e",
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          Sesuai
                        </span>
                      )}
                      {info.status === "mismatch" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#ef4444",
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                          Tidak Sesuai
                        </span>
                      )}
                      {info.status === "open" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            background: "rgba(156, 163, 175, 0.15)",
                            color: "#9ca3af",
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                          </svg>
                          Belum Ditutup
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Menampilkan {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredReports.length)} dari {filteredReports.length} shift
          </span>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              disabled={safePage <= 1}
              onClick={() => handlePageChange(safePage - 1)}
              style={{
                padding: "0.4rem 0.75rem",
                background: "var(--bg-body)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "0.375rem",
                cursor: safePage <= 1 ? "not-allowed" : "pointer",
                opacity: safePage <= 1 ? 0.5 : 1,
                fontSize: "0.8125rem",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              ← Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: "0.4rem 0.65rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  border: page === safePage ? "1px solid var(--primary)" : "1px solid var(--border)",
                  background: page === safePage ? "rgba(99, 102, 241, 0.15)" : "var(--bg-body)",
                  color: page === safePage ? "#818cf8" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minWidth: "32px",
                }}
              >
                {page}
              </button>
            ))}

            <button
              disabled={safePage >= totalPages}
              onClick={() => handlePageChange(safePage + 1)}
              style={{
                padding: "0.4rem 0.75rem",
                background: "var(--bg-body)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "0.375rem",
                cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                opacity: safePage >= totalPages ? 0.5 : 1,
                fontSize: "0.8125rem",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

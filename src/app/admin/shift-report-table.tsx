"use client";

import { useState } from "react";
import type { ShiftReport } from "./dashboard-actions";

interface ShiftReportTableProps {
  reports: ShiftReport[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShiftReportTable({ reports }: ShiftReportTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = reports.filter(
    (report) =>
      report.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDateTime(report.startTime).toLowerCase().includes(searchTerm.toLowerCase())
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.25rem 0" }}>
            Laporan Kinerja Shift
          </h3>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.875rem" }}>
            Ringkasan transaksi dan pendapatan kasir per shift
          </p>
        </div>

        <div style={{ position: "relative", width: "250px" }}>
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
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "36px", width: "100%", fontSize: "0.875rem" }}
          />
        </div>
      </div>

      <div className="history-table-container">
        {filteredReports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            Tidak ada data laporan shift yang ditemukan.
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
                <th style={{ textAlign: "right" }}>Total Akhir Laci</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                      {new Date(report.startTime).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.125rem" }}>
                      {formatTime(report.startTime)} - {report.endTime ? formatTime(report.endTime) : "Aktif"}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{report.cashierName}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ 
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "#818cf8",
                      padding: "2px 8px",
                      borderRadius: "1rem",
                      fontWeight: 600,
                      fontSize: "0.8125rem"
                    }}>
                      {report.totalTransactions}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontSize: "0.875rem" }}>
                    {formatCurrency(report.startingCash)}
                  </td>
                  <td style={{ textAlign: "right", fontSize: "0.875rem" }}>
                    {formatCurrency(report.totalCashSales)}
                  </td>
                  <td style={{ textAlign: "right", fontSize: "0.875rem" }}>
                    {formatCurrency(report.totalDebitSales)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "var(--success)", fontSize: "0.875rem" }}>
                    {report.endingCash ? formatCurrency(report.endingCash) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

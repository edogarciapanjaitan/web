"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DashboardStat } from "./dashboard-actions";

interface DashboardChartProps {
  data: DashboardStat[];
  initialChartType: string;
}

type ChartType = "transactions" | "items";

export default function DashboardChart({ data, initialChartType }: DashboardChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const chartType = (initialChartType === "items" ? "items" : "transactions") as ChartType;

  const setChartType = (type: ChartType) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (type === "transactions") {
        params.delete("chart");
      } else {
        params.set("chart", type);
      }
      router.push(`/admin?${params.toString()}`);
    });
  };

  // Format date correctly for display (e.g., '14 Mar' from '2026-03-14')
  const formattedData = data.map((item) => {
    const dateObj = new Date(item.date);
    return {
      ...item,
      displayDate: dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
    };
  });

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "1.5rem",
        marginBottom: "2rem",
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
            Laporan Penjualan Harian
          </h3>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.875rem" }}>
            Data riwayat 7 hari terakhir
          </p>
        </div>

        {/* Filter Toggle */}
        <div style={{ display: "flex", gap: "0.5rem", background: "var(--bg-body)", padding: "0.25rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
          <button
            onClick={() => setChartType("transactions")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              background: chartType === "transactions" ? "var(--bg-card)" : "transparent",
              color: chartType === "transactions" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: chartType === "transactions" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Total Transaksi
          </button>
          <button
            onClick={() => setChartType("items")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              background: chartType === "items" ? "var(--bg-card)" : "transparent",
              color: chartType === "items" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: chartType === "items" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Total Item Terjual
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              dx={-10}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                color: "var(--text-primary)",
              }}
              itemStyle={{ color: "var(--text-primary)", fontWeight: 500 }}
              labelStyle={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}
            />
            <Legend wrapperStyle={{ paddingTop: "1rem" }} />

            {/* Render lines conditionally based on current filter */}
            {chartType === "transactions" && (
              <Line
                type="monotone"
                name="Total Transaksi"
                dataKey="totalTransactions"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "var(--bg-card)" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            )}
            
            {chartType === "items" && (
              <Line
                type="monotone"
                name="Item Terjual"
                dataKey="totalItemsSold"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "var(--bg-card)" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

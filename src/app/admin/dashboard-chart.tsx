"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DashboardStat, TopProductStat } from "./dashboard-actions";

interface DashboardChartProps {
  data: DashboardStat[];
  topProducts: TopProductStat[];
  initialChartType: string;
  selectedMonth: number;
  selectedYear: number;
}

type ChartType = "transactions" | "items" | "top_products";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function DashboardChart({ 
  data, 
  topProducts, 
  initialChartType,
  selectedMonth,
  selectedYear
}: DashboardChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const chartType = (initialChartType === "items" ? "items" : initialChartType === "top_products" ? "top_products" : "transactions") as ChartType;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // Generate years from 2026 to currentYear + 1
  const years = Array.from({ length: Math.max(currentYear - 2026 + 2, 2) }, (_, i) => 2026 + i);

  const todayDisplayString = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  const updateURL = (type: ChartType, month: number, year: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (type === "transactions") {
        params.delete("chart");
      } else {
        params.set("chart", type);
      }
      params.set("month", month.toString());
      params.set("year", year.toString());
      router.push(`/admin?${params.toString()}`);
    });
  };

  const handleTypeChange = (type: ChartType) => updateURL(type, selectedMonth, selectedYear);
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateURL(chartType, parseInt(e.target.value), selectedYear);
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => updateURL(chartType, selectedMonth, parseInt(e.target.value));

  // Format date correctly for display (e.g., '14 Mar' from '2026-03-14')
  const formattedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      const dateObj = new Date(item.date);
      return {
        ...item,
        displayDate: dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
      };
    });
  }, [data]);

  // Check if there is actual numerical data instead of just empty days
  const hasNumericalData = useMemo(() => {
    return formattedData.some(item => (item.totalTransactions || 0) > 0 || (item.totalItemsSold || 0) > 0);
  }, [formattedData]);

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
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: "0 0 0.25rem 0" }}>
            Laporan Kinerja Bulanan
          </h3>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.875rem" }}>
            Data riwayat per bulan
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {/* Filters Month / Year */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{ 
                padding: "0.4rem 2rem 0.4rem 0.75rem", 
                fontSize: "0.875rem", 
                width: "auto",
                backgroundColor: "#1e293b",
                color: "#f8fafc",
                border: "1px solid #334155",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              style={{ 
                padding: "0.4rem 2rem 0.4rem 0.75rem", 
                fontSize: "0.875rem", 
                width: "auto",
                backgroundColor: "#1e293b",
                color: "#f8fafc",
                border: "1px solid #334155",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Filter Toggle Chart Type */}
          <div style={{ display: "flex", gap: "0.5rem", background: "var(--bg-body)", padding: "0.25rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
            <button
              onClick={() => handleTypeChange("transactions")}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
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
              onClick={() => handleTypeChange("items")}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                border: "none",
                background: chartType === "items" ? "var(--bg-card)" : "transparent",
                color: chartType === "items" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: chartType === "items" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Total Item
            </button>
            <button
              onClick={() => handleTypeChange("top_products")}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                border: "none",
                background: chartType === "top_products" ? "var(--bg-card)" : "transparent",
                color: chartType === "top_products" ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: chartType === "top_products" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Produk Terlaris
            </button>
          </div>
        </div>
      </div>

      {/* Empty State when no transactions happened in this month */}
      {chartType !== "top_products" && !hasNumericalData && (
         <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ margin: "0 auto 1rem", opacity: 0.3 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Belum ada transaksi sama sekali di periode {MONTHS[selectedMonth - 1]} {selectedYear}.
         </div>
      )}

      {chartType === "top_products" && (!topProducts || topProducts.length === 0) && (
         <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ margin: "0 auto 1rem", opacity: 0.3 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            Belum ada produk yang terjual di periode {MONTHS[selectedMonth - 1]} {selectedYear}.
         </div>
      )}

      {/* Recharts Container */}
      {(chartType !== "top_products" ? hasNumericalData : (topProducts && topProducts.length > 0)) && (
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "top_products" ? (
               <BarChart
                 data={topProducts}
                 margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
               >
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                 <XAxis
                   dataKey="name"
                   axisLine={false}
                   tickLine={false}
                   tickFormatter={(val: string) => val.length > 12 ? val.slice(0, 12) + "..." : val}
                   tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                   angle={-30}
                   textAnchor="end"
                   dy={15}
                   height={60}
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
                   formatter={(value: any) => [`${value} terjual`, "Total Kuantitas"]}
                   labelFormatter={(label, payload) => {
                     if (payload && payload.length > 0 && payload[0].payload) {
                        return payload[0].payload.name;
                     }
                     return label;
                   }}
                   labelStyle={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}
                   cursor={{ fill: "var(--body-bg)", opacity: 0.4 }}
                 />
                 <Bar 
                   dataKey="totalQuantity" 
                   name="Kuantitas Terjual"
                   fill="#f59e0b"
                   radius={[4, 4, 0, 0]}
                   barSize={40}
                   animationDuration={1500}
                 />
               </BarChart>
            ) : (
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

                {chartType === "transactions" && (
                  <Line
                    type="monotone"
                    name="Total Transaksi"
                    dataKey="totalTransactions"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      const isToday = selectedMonth === currentMonth && selectedYear === currentYear && payload.displayDate === todayDisplayString;
                      return (
                        <circle 
                          key={`dot-tx-${index}`}
                          cx={cx} 
                          cy={cy} 
                          r={isToday ? 6 : 3} 
                          stroke={isToday ? "#ef4444" : "#6366f1"} 
                          strokeWidth={isToday ? 3 : 2} 
                          fill={isToday ? "#fff1f2" : "var(--bg-card)"} 
                        />
                      );
                    }}
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
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      const isToday = selectedMonth === currentMonth && selectedYear === currentYear && payload.displayDate === todayDisplayString;
                      return (
                        <circle 
                          key={`dot-items-${index}`}
                          cx={cx} 
                          cy={cy} 
                          r={isToday ? 6 : 3} 
                          stroke={isToday ? "#ef4444" : "#22c55e"} 
                          strokeWidth={isToday ? 3 : 2} 
                          fill={isToday ? "#fff1f2" : "var(--bg-card)"} 
                        />
                      );
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={1500}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

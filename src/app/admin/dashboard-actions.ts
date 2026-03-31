"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface DashboardStat {
  date: string;
  totalTransactions: number;
  totalItemsSold: number;
}

export async function getDashboardStatsAction(days: number = 7) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return { success: false, data: [] };
    }

    const response = await fetch(`${API_URL}/transactions/dashboard-stats?days=${days}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("STATS API response not ok", response.status, await response.text());
      return { success: false, data: [] };
    }

    const data = await response.json();
    console.log("SUCCESS dashboard stats fetch! Return length:", data.data?.length);

    return {
      success: true,
      data: data.data as DashboardStat[],
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return { success: false, data: [] };
  }
}

export interface ShiftReport {
  id: string;
  cashierName: string;
  startTime: string;
  endTime: string | null;
  startingCash: number;
  endingCash: number | null;
  totalCashSales: number;
  totalDebitSales: number;
  totalTransactions: number;
}

export async function getDailyShiftReportAction(days: number = 7) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return { success: false, data: [] };
    }

    const response = await fetch(`${API_URL}/shifts/daily-report?days=${days}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("SHIFT API response not ok", response.status, await response.text());
      return { success: false, data: [] };
    }

    const data = await response.json();
    console.log("SUCCESS shift reports fetch! Return length:", data.data?.length);

    return {
      success: true,
      data: data.data as ShiftReport[],
    };
  } catch (error) {
    console.error("Failed to fetch shift reports:", error);
    return { success: false, data: [] };
  }
}

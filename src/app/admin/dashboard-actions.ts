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
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return { success: false, data: [] };
    }

    const response = await fetch(`${API_URL}/transactions/dashboard-stats?days=${days}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("API response not ok", response.status);
      return { success: false, data: [] };
    }

    const data = await response.json();


    return {
      success: true,
      data: data.data as DashboardStat[],
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return { success: false, data: [] };
  }
}

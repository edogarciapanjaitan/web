"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// --- Types ---

export interface TransactionItem {
  id: string;
  quantity: number;
  priceAtSale: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface TransactionData {
  id: string;
  invoiceNumber: string;
  totalPrice: number;
  paymentMethod: "CASH" | "DEBIT";
  amountPaid: number | null;
  change: number | null;
  debitCardNo: string | null;
  createdAt: string;
  items: TransactionItem[];
}

export interface DailyHistoryResponse {
  success: boolean;
  data?: TransactionData[];
  message?: string;
}

// --- Helper ---

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value ?? null;
}

// --- Server Actions ---

/**
 * Fetch daily transaction history from the backend API.
 * Uses SSR fetching with the user's auth token.
 */
export async function fetchDailyHistory(dateStr?: string): Promise<DailyHistoryResponse> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Sesi Anda telah berakhir. Silakan login ulang." };
  }

  try {
    const queryParams = new URLSearchParams();
    if (dateStr) {
      queryParams.append("date", dateStr);
    }

    const response = await fetch(`http://localhost:3001/api/transactions/history?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Using no-store because history can change frequently and we want fresh data
      cache: "no-store", 
    });

    const body = await response.json();

    if (!response.ok) {
      return { success: false, message: body.message || "Gagal mengambil riwayat transaksi." };
    }

    return {
      success: true,
      data: body.data,
    };
  } catch (error) {
    return { success: false, message: "Tidak dapat terhubung ke server. Pastikan server nyala." };
  }
}

/**
 * Revalidate the history page to force a refresh on the UI.
 * Can be called after a new transaction is made.
 */
export async function revalidateHistory() {
  revalidatePath("/dashboard/history");
}

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// --- Helper: get auth token from cookie ---

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value ?? null;
}

// --- Types ---

export interface ProductResult {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string | null;
  imageUrl?: string | null;
}

export interface TransactionResult {
  id: string;
  invoiceNumber: string;
  totalPrice: number;
  paymentMethod: "CASH" | "DEBIT";
  amountPaid: number | null;
  change: number | null;
  debitCardNo: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    priceAtSale: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }[];
}

interface ActionState {
  success: boolean;
  message: string;
  data?: TransactionResult;
}

// --- Server Actions ---

/**
 * Fetch catalog products with pagination and category filter.
 */
export async function fetchCatalogProducts(
  page: number = 1,
  category: string = ""
): Promise<{ data: ProductResult[]; meta: any }> {
  const token = await getAuthToken();
  if (!token) return { data: [], meta: { pages: 0, total: 0, categories: [] } };

  try {
    const url = new URL("http://localhost:3001/api/products/catalog");
    url.searchParams.append("page", page.toString());
    if (category && category !== "Semua") {
      url.searchParams.append("category", category);
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return { data: [], meta: { pages: 0, total: 0, categories: [] } };

    const result = await response.json();
    return { data: result.data || [], meta: result.meta || {} };
  } catch {
    return { data: [], meta: { pages: 0, total: 0, categories: [] } };
  }
}

/**
 * Search products by name or SKU.
 */
export async function searchProducts(
  query: string
): Promise<ProductResult[]> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(
      `http://localhost:3001/api/products/search?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Create a new transaction.
 */
export async function createTransactionAction(payload: {
  shiftId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: "CASH" | "DEBIT";
  amountPaid?: number;
  debitCardNo?: string;
}): Promise<ActionState> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Sesi Anda telah berakhir. Silakan login ulang.",
    };
  }

  // Validate debit card number
  if (payload.paymentMethod === "DEBIT") {
    const digits = (payload.debitCardNo || "").replace(/\D/g, "");
    if (digits.length !== 16) {
      return {
        success: false,
        message: "Nomor kartu debit harus 16 digit",
      };
    }
  }

  try {
    const response = await fetch("http://localhost:3001/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Gagal membuat transaksi",
      };
    }

    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Transaksi berhasil!",
      data: data.data,
    };
  } catch {
    return {
      success: false,
      message: "Tidak bisa terhubung ke server.",
    };
  }
}

/**
 * Fetch transactions for a specific shift.
 */
export async function fetchShiftTransactions(
  shiftId: string
): Promise<TransactionResult[]> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(
      `http://localhost:3001/api/transactions?shiftId=${encodeURIComponent(shiftId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

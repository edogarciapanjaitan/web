"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminProducts } from "../products/products-actions";

const API_URL = "http://localhost:3001/api/products";

export interface StockAdjustmentData {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

export async function fetchStockProducts(page: number = 1, search: string = "") {
  // Reuse the getAdminProducts since we just need the list of products
  return getAdminProducts(page, search);
}

export async function adjustStockAction(id: string, delta: number): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    const response = await fetch(`${API_URL}/${id}/stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ delta }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || "Gagal mengubah stok" };
    }

    revalidatePath("/admin/stock");
    return { success: true, message: "Stok berhasil diperbarui" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

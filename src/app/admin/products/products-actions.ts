"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = "http://localhost:3001/api/products";

export interface ProductData {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string | null;
}

interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Ensure every request has auth token
async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminProducts(page: number = 1, search: string = "") {
  try {
    const headers = await getAuthHeader();
    const url = new URL(API_URL);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", "10");
    if (search) {
      url.searchParams.append("search", search);
    }

    const response = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
         return { data: [], meta: { total: 0, pages: 0, currentPage: 1 }, error: "Unauthorized" };
      }
      return { data: [], meta: { total: 0, pages: 0, currentPage: 1 } };
    }

    const { data, meta } = await response.json();
    return { data, meta };
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return { data: [], meta: { total: 0, pages: 0, currentPage: 1 } };
  }
}

export async function createProductAction(formData: FormData): Promise<ActionResponse> {
  try {
    const data = {
      name: formData.get("name"),
      sku: formData.get("sku"),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      category: formData.get("category") || null,
    };

    const headers = await getAuthHeader();
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || "Gagal menambah produk" };
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Produk berhasil ditambahkan" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function updateProductAction(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    const data = {
      name: formData.get("name"),
      sku: formData.get("sku"),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      category: formData.get("category") || null,
    };

    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || "Gagal mengubah produk" };
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Produk berhasil diubah" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResponse> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || "Gagal menghapus produk" };
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Produk berhasil dihapus" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

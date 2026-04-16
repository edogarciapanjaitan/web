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
  imageUrl?: string | null;
}

interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Ensure every request has auth token
async function getAuthHeader(isFormData = false) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const headers: any = {
    Authorization: `Bearer ${token}`,
  };
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
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
    const name = (formData.get("name") as string)?.trim();
    const sku = (formData.get("sku") as string)?.trim();
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;

    const price = Number(priceStr);
    const stock = Number(stockStr);

    if (!name) return { success: false, message: "Nama produk harus diisi" };
    if (!sku) return { success: false, message: "SKU harus diisi" };
    if (isNaN(price) || price < 0) return { success: false, message: "Harga tidak valid" };
    if (isNaN(stock) || stock < 0) return { success: false, message: "Stok tidak valid" };

    const headers = await getAuthHeader(true); 
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: formData,
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
    const name = (formData.get("name") as string)?.trim();
    const sku = (formData.get("sku") as string)?.trim();
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;

    const price = Number(priceStr);
    const stock = Number(stockStr);

    if (!name) return { success: false, message: "Nama produk harus diisi" };
    if (!sku) return { success: false, message: "SKU harus diisi" };
    if (isNaN(price) || price < 0) return { success: false, message: "Harga tidak valid" };
    if (isNaN(stock) || stock < 0) return { success: false, message: "Stok tidak valid" };

    const headers = await getAuthHeader(true); // true means it's FormData
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers,
      body: formData,
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

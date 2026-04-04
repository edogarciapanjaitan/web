"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = "http://localhost:3001/api/users";

export interface WorkerData {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface ActionResponse {
  success: boolean;
  message: string;
}

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminWorkers(page: number = 1, search: string = "") {
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
    console.error("Error fetching admin workers:", error);
    return { data: [], meta: { total: 0, pages: 0, currentPage: 1 } };
  }
}

export async function createWorkerAction(formData: FormData): Promise<ActionResponse> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const username = (formData.get("username") as string)?.trim();
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "CASHIER";

    if (!username) return { success: false, message: "Username harus diisi" };
    if (!role) return { success: false, message: "Peran harus dipilih" };
    if (!password || password.length < 6) return { success: false, message: "Password harus diisi (minimal 6 karakter)" };

    const data = {
      name,
      username,
      password,
      role,
    };

    const headers = await getAuthHeader();
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || "Gagal menambah pengguna" };
    }

    revalidatePath("/admin/workers");
    return { success: true, message: "Pengguna berhasil ditambahkan" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function updateWorkerAction(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const username = (formData.get("username") as string)?.trim();
    const role = (formData.get("role") as string) || "CASHIER";
    const password = formData.get("password") as string || "";

    if (!username) return { success: false, message: "Username harus diisi" };
    if (!role) return { success: false, message: "Peran harus dipilih" };

    const data = {
      name,
      username,
      role,
      password,
    };

    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || "Gagal mengubah pengguna" };
    }

    revalidatePath("/admin/workers");
    return { success: true, message: "Pengguna berhasil diubah" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function deleteWorkerAction(id: string): Promise<ActionResponse> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || "Gagal menghapus pengguna" };
    }

    revalidatePath("/admin/workers");
    return { success: true, message: "Pengguna berhasil dihapus" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

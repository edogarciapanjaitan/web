"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Validation Schemas ---

const startShiftSchema = z.object({
  startingCash: z.coerce
    .number({ message: "Uang awal harus berupa angka" })
    .min(0, "Uang awal tidak boleh negatif")
    .max(100_000_000, "Uang awal maksimal Rp 100.000.000"),
});

const endShiftSchema = z.object({
  endingCash: z.coerce
    .number({ message: "Uang akhir harus berupa angka" })
    .min(0, "Uang akhir tidak boleh negatif")
    .max(100_000_000, "Uang akhir maksimal Rp 100.000.000"),
});

// --- Types ---

interface ShiftActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// --- Helper: get auth token from cookie ---

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value ?? null;
}

// --- Server Actions ---

export async function startShiftAction(
  _prevState: ShiftActionState | null,
  formData: FormData
): Promise<ShiftActionState> {
  const raw = { startingCash: formData.get("startingCash") };
  const validated = startShiftSchema.safeParse(raw);

  if (!validated.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Sesi Anda telah berakhir. Silakan login ulang." };
  }

  try {
    const response = await fetch("http://localhost:3001/api/shifts/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validated.data),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Gagal memulai shift" };
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Shift berhasil dimulai!" };
  } catch {
    return { success: false, message: "Tidak bisa terhubung ke server." };
  }
}

export async function endShiftAction(
  _prevState: ShiftActionState | null,
  formData: FormData
): Promise<ShiftActionState> {
  const raw = { endingCash: formData.get("endingCash") };
  const validated = endShiftSchema.safeParse(raw);

  if (!validated.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Sesi Anda telah berakhir. Silakan login ulang." };
  }

  try {
    const response = await fetch("http://localhost:3001/api/shifts/end", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validated.data),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Gagal mengakhiri shift" };
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Shift berhasil diakhiri!" };
  } catch {
    return { success: false, message: "Tidak bisa terhubung ke server." };
  }
}

/**
 * Fetch active shift data from API (for SSR usage).
 */
export async function fetchActiveShift() {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch("http://localhost:3001/api/shifts", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

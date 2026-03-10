"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

// --- Validation Schema ---

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh huruf, angka, dan underscore"
    ),
  password: z
    .string()
    .trim()
    .min(6, "Password minimal 6 karakter")
    .max(128, "Password maksimal 128 karakter"),
});

// --- Types ---

interface LoginState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// --- Server Action ---

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  // 1. Validate input
  const raw = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const validated = loginSchema.safeParse(raw);

  if (!validated.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // 2. Call backend API
  try {
    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated.data),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login gagal",
      };
    }

    // 3. Set HTTP-only cookie (secure, not accessible by client JS)
    const cookieStore = await cookies();
    cookieStore.set("auth-token", data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    // Also store user info (non-sensitive) for client-side usage
    cookieStore.set("user-info", JSON.stringify(data.data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
  } catch {
    return {
      success: false,
      message: "Tidak bisa terhubung ke server. Coba lagi nanti.",
    };
  }

  // 4. Redirect to dashboard
  redirect("/dashboard");
}

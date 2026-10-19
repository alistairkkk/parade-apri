"use server";

import { redirect } from "next/navigation";
import { createSupabaseSessionClient } from "@/lib/supabase";

/**
 * Helper untuk memeriksa sesi admin di server.
 * Memastikan aksi yang mengubah data hanya dapat dijalankan oleh admin yang login.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { user, supabase };
}

/**
 * Server Action untuk login admin.
 * Mendukung penggunaan melalui useActionState maupun form action langsung.
 */
export async function login(prevState, formData) {
  const isActionState = formData instanceof FormData;
  const data = isActionState ? formData : prevState;

  const email = data?.get ? data.get("email") : null;
  const password = data?.get ? data.get("password") : null;

  if (!email || !password) {
    const pesan = "Email dan password wajib diisi.";
    if (isActionState) {
      return { error: pesan };
    }
    redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
  }

  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    const pesan =
      error.message === "Invalid login credentials"
        ? "Email atau password salah."
        : error.message || "Gagal masuk. Periksa kembali email dan password.";
    if (isActionState) {
      return { error: pesan };
    }
    redirect(`/admin/login?error=${encodeURIComponent(pesan)}`);
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke /admin/login.
 */
export async function logout() {
  try {
    const supabase = await createSupabaseSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan error jika sesi sudah tidak ada
  }

  redirect("/admin/login");
}

export const keluar = logout;

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memvalidasi minimal 8 karakter dan kesesuaian konfirmasi password.
 */
export async function gantiPassword(prevState, formData) {
  const isActionState = formData instanceof FormData;
  const data = isActionState ? formData : prevState;

  const passwordBaru = data?.get ? data.get("password_baru") : null;
  const konfirmasiPassword = data?.get ? data.get("konfirmasi_password") : null;

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  const passwordBaruStr = String(passwordBaru);
  const konfirmasiPasswordStr = String(konfirmasiPassword);

  if (passwordBaruStr.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaruStr !== konfirmasiPasswordStr) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  const auth = await requireAdmin();
  if (!auth) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const { error } = await auth.supabase.auth.updateUser({
    password: passwordBaruStr,
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: "Password berhasil diganti." };
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseSessionClient } from "@/lib/supabase";

const timeoutLLM = 15000;

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

export async function buatDeskripsiAI({ nama, kategori }) {
  if (!(await requireAdmin())) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const baseUrl = process.env.LLM_BASE_URL?.trim();
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL?.trim();
  if (!baseUrl || !apiKey?.trim() || !model) {
    return { error: "Konfigurasi LLM belum lengkap. Isi LLM_BASE_URL, LLM_API_KEY, dan LLM_MODEL di environment server." };
  }
  if (typeof nama !== "string" || !nama.trim()) {
    return { error: "Nama produk wajib diisi." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutLLM);
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Tulis deskripsi produk singkat dan menarik dalam Bahasa Indonesia. Jangan menambahkan fakta yang tidak diberikan.",
          },
          {
            role: "user",
            content: `Buat deskripsi singkat untuk produk bernama ${nama.trim()} dengan kategori ${typeof kategori === "string" && kategori.trim() ? kategori.trim() : "tidak ditentukan"}.`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { error: `Layanan AI gagal merespons (HTTP ${response.status}). Coba lagi nanti.` };
    }

    let result;
    try {
      result = await response.json();
    } catch {
      return { error: "Respons layanan AI tidak valid. Coba lagi nanti." };
    }
    const deskripsi = result?.choices?.[0]?.message?.content;
    if (typeof deskripsi !== "string" || !deskripsi.trim()) {
      return { error: "Layanan AI mengembalikan deskripsi kosong. Coba lagi." };
    }
    return { deskripsi: deskripsi.trim() };
  } catch (error) {
    return {
      error: error?.name === "AbortError"
        ? "Permintaan ke layanan AI melewati batas waktu. Coba lagi."
        : "Tidak dapat menghubungi layanan AI. Periksa koneksi server dan coba lagi.",
    };
  } finally {
    clearTimeout(timeout);
  }
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

/**
 * Server Action untuk menambah produk baru (US-08).
 * Wajib login admin terlebih dahulu; jika belum login, tidak menulis apa pun ke database.
 */
export async function tambahProduk(prevState, formData) {
  const auth = await requireAdmin();
  if (!auth) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const isActionState = formData instanceof FormData;
  const data = isActionState ? formData : prevState;

  const nama = data?.get ? data.get("nama") : null;
  const harga = data?.get ? data.get("harga") : null;

  if (!nama || !String(nama).trim()) {
    return { error: "Nama produk wajib diisi." };
  }

  const hargaStr = String(harga ?? "").trim();
  if (!hargaStr || Number.isNaN(Number(hargaStr)) || Number(hargaStr) < 0) {
    return { error: "Harga wajib diisi dengan angka yang tidak negatif." };
  }

  const { error } = await auth.supabase.from("produk").insert({
    nama: String(nama).trim(),
    harga: Number(hargaStr),
    kategori: data?.get("kategori") ? String(data.get("kategori")).trim() : null,
    foto_url: data?.get("foto_url") ? String(data.get("foto_url")).trim() : null,
    deskripsi: data?.get("deskripsi") ? String(data.get("deskripsi")).trim() : null,
  });

  if (error) {
    return { error: error.message || "Gagal menyimpan produk." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

/**
 * Server Action untuk mengubah produk (US-09).
 * Wajib requireAdmin() dulu, lalu update baris dengan id tersebut memakai supabase sesi admin,
 * revalidatePath("/") dan revalidatePath("/admin"), lalu redirect("/admin").
 */
export async function ubahProduk(arg1, arg2, arg3) {
  const auth = await requireAdmin();
  if (!auth) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  let targetId;
  let data;

  if (arg3 instanceof FormData) {
    targetId = arg1;
    data = arg3;
  } else if (arg2 instanceof FormData) {
    data = arg2;
    targetId = data.get("id") || arg1;
  } else if (arg1 instanceof FormData) {
    data = arg1;
    targetId = data.get("id");
  } else {
    targetId = arg1;
    data = arg2;
  }

  const nama = data?.get ? data.get("nama") : null;
  const harga = data?.get ? data.get("harga") : null;

  if (!nama || !String(nama).trim()) {
    return { error: "Nama produk wajib diisi." };
  }

  const hargaStr = String(harga ?? "").trim();
  if (!hargaStr || Number.isNaN(Number(hargaStr)) || Number(hargaStr) < 0) {
    return { error: "Harga wajib diisi dengan angka yang tidak negatif." };
  }

  const { error } = await auth.supabase
    .from("produk")
    .update({
      nama: String(nama).trim(),
      harga: Number(hargaStr),
      kategori: data?.get("kategori") ? String(data.get("kategori")).trim() : null,
      foto_url: data?.get("foto_url") ? String(data.get("foto_url")).trim() : null,
      deskripsi: data?.get("deskripsi") ? String(data.get("deskripsi")).trim() : null,
    })
    .eq("id", targetId);

  if (error) {
    return { error: error.message || "Gagal mengubah produk." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

/**
 * Server Action untuk menghapus produk (US-10).
 * Wajib requireAdmin() dulu, lalu delete baris produk berdasarkan id,
 * revalidatePath("/") dan revalidatePath("/admin").
 * Terima id lewat FormData dan tidak percaya id dari client tanpa memeriksa sesi admin.
 */
export async function hapusProduk(prevStateOrFormData, maybeFormData) {
  const auth = await requireAdmin();
  if (!auth) {
    return { error: "Anda harus login terlebih dahulu." };
  }

  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;
  const id = formData?.get ? formData.get("id") : null;

  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  const { error } = await auth.supabase
    .from("produk")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message || "Gagal menghapus produk." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

import { createClient } from "@supabase/supabase-js";

/**
 * Membuat client Supabase di sisi server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca katalog produk dan detail produk (pengunjung publik)
 * karena RLS menolak akses publik langsung ke tabel.
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Alias untuk fleksibilitas pemanggilan fungsi
export const createSupabaseServer = createSupabaseServerClient;
export const getSupabaseServerClient = createSupabaseServerClient;


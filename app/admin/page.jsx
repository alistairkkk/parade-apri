import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSupabaseSessionClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  let daftarProduk = [];

  try {
    const supabase = await createSupabaseSessionClient();
    const { data } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    daftarProduk = data ?? [];
  } catch {
    daftarProduk = [];
  }

  const belumAdaProduk = daftarProduk.length === 0;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      {belumAdaProduk ? (
        <p className="rounded-xl border border-dashed border-garis bg-permukaan p-8 text-center text-sm text-teks-lembut">
          Belum ada produk. Klik “Tambah produk” untuk menambahkan produk pertama.
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}

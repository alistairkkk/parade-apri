import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";
import { toko } from "@/lib/toko";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const sp = (await searchParams) || {};
  const cari = (
    typeof sp.q === "string"
      ? sp.q
      : typeof sp.nama === "string"
      ? sp.nama
      : ""
  ).trim();
  const kategoriTerpilih = (
    typeof sp.kategori === "string" ? sp.kategori : ""
  ).trim();

  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = createSupabaseServerClient();

    // Mengambil daftar kategori unik untuk pilihan dropdown
    const { data: dataKategori, error: errorKategori } = await supabase
      .from("produk")
      .select("kategori");

    if (!errorKategori && dataKategori) {
      daftarKategori = Array.from(
        new Set(
          dataKategori
            .map((p) => p.kategori)
            .filter((k) => Boolean(k && k.trim()))
        )
      ).sort();
    }

    // Query produk dengan penyaring di sisi server
    let query = supabase.from("produk").select("*");

    if (cari) {
      query = query.ilike("nama", `%${cari}%`);
    }

    if (kategoriTerpilih) {
      query = query.eq("kategori", kategoriTerpilih);
    }

    query = query.order("id", { ascending: true });

    const { data, error } = await query;

    if (error) {
      pesanError = error.message;
    } else {
      daftarProduk = data ?? [];
    }
  } catch (err) {
    pesanError = err?.message || "Terjadi kesalahan saat menghubungkan ke database.";
  }

  const adaFilterAktif = Boolean(cari || kategoriTerpilih);

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {/* Form penyaring (pencarian nama & pilihan kategori) */}
        <form method="GET" action="/" className="grid gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <label htmlFor="q" className="mb-1.5 block text-sm font-semibold">
              Cari produk
            </label>
            <input
              type="text"
              id="q"
              name="q"
              defaultValue={cari}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="kategori" className="mb-1.5 block text-sm font-semibold">
              Kategori
            </label>
            <select
              id="kategori"
              name="kategori"
              defaultValue={kategoriTerpilih}
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-base text-teks focus:border-utama focus:outline-none"
            >
              <option value="">Semua kategori</option>
              {daftarKategori.map((kategori) => (
                <option key={kategori} value={kategori}>
                  {kategori}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Tombol type="submit" className="w-full">
              Cari
            </Tombol>
            {adaFilterAktif && (
              <Tombol href="/" varian="garis">
                Reset
              </Tombol>
            )}
          </div>
        </form>

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center">
            <p className="font-semibold text-bahaya">Gagal mengambil data produk</p>
            <p className="mt-1 text-sm text-teks-lembut">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-xl border border-dashed border-garis bg-permukaan p-8 text-center text-sm text-teks-lembut">
            {adaFilterAktif ? "tidak ada produk yang cocok" : "Belum ada produk"}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

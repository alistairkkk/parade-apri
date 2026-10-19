# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:** Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase. Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:** Berhasil. File baru `lib/supabase/server.js` dan `lib/supabase/index.js` dibuat untuk koneksi server. `app/page.jsx` diubah menjadi async Server Component yang mengambil data dari Supabase. Menampilkan produk, pesan error, atau pesan kosong sesuai kondisi. `CatatanBelumAktif` dan import `data-contoh` dihapus.

**Perbaikan:** Tidak ada perbaikan yang diperlukan.

## US-02 Detail produk

**Prompt:** Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:** Berhasil. `app/produk/[id]/page.jsx` diubah menggunakan `createSupabaseServerClient()` dan query `.eq("id", id).maybeSingle()`. Memanggil `notFound()` jika produk tidak ditemukan atau terjadi error. Import `cariProdukContoh` dan `CatatanBelumAktif` dihapus.

**Perbaikan:** Tidak ada perbaikan yang diperlukan.

## US-03 Pesan via WhatsApp

**Prompt:** Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:** Berhasil. `components/TombolWhatsApp.jsx` diubah dari `<button>` menjadi `<a>` dengan `target="_blank"` dan `rel="noopener noreferrer"`. Pesan otomatis berisi nama dan harga produk dalam format rupiah, di-encode dengan `encodeURIComponent`. Tampilan tombol dipertahankan.

**Perbaikan:** Tidak ada perbaikan yang diperlukan.

## US-04 Login admin

**Prompt:** Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:** Berhasil. File baru `lib/supabase/session.js` dibuat untuk koneksi sesi admin via `@supabase/ssr`. File baru `app/admin/actions.js` dibuat berisi Server Action `login` dan `logout`. Halaman login diubah menjadi client component yang memakai `useActionState` untuk menampilkan error. Tombol "Keluar" di `NavAdmin.jsx` disambungkan ke Server Action `logout`.

**Perbaikan:** Tidak ada perbaikan yang diperlukan.

## US-05 Ganti password

**Prompt:** Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:** Berhasil. Server Action `gantiPassword` ditambahkan ke `app/admin/actions.js` dengan validasi sisi server (minimal 8 karakter, konfirmasi cocok, admin harus login). Halaman password diubah menjadi client component dengan `useActionState` yang menampilkan pesan berhasil (hijau) atau error (merah).

**Perbaikan:** Tidak ada perbaikan yang diperlukan.

## US-06 Proteksi halaman admin

**Prompt:** Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:** Berhasil. File `proxy.js` dibuat di root proyek dengan matcher `/admin/:path*`. Menggunakan `@supabase/ssr` untuk membaca cookie sesi dan memeriksa `supabase.auth.getUser()`. Jika belum login, dialihkan ke `/admin/login`. Helper `requireAdmin()` ditambahkan di `app/admin/actions.js` untuk memeriksa login di setiap Server Action yang mengubah data. `CatatanBelumAktif` dihapus dari halaman `/admin`.

**Perbaikan:** Tidak ada perbaikan yang diperlukan.

## Debugging dan fitur bonus

Tambahkan bagian baru untuk setiap error yang kamu perbaiki atau fitur bonus yang kamu kerjakan.

### US-07 List produk admin **[SENDIRI]**

**Prompt:** (Dikerjakan bersamaan saat US-06) Ubah app/admin/page.jsx supaya mengambil daftar produk dari database memakai Supabase sesi admin.

**Hasil:** Berhasil. `app/admin/page.jsx` diubah menjadi async Server Component yang mengambil data produk dari Supabase. Import `produkContoh` dihapus. Menampilkan pesan "Belum ada produk" jika tabel kosong.

### US-08 Tambah produk **[SENDIRI]**

**Prompt:** Buat Server Action tambahProduk di app/admin/actions.js: wajib requireAdmin() dulu, lalu insert ke tabel produk memakai supabase sesi admin, revalidatePath("/") dan revalidatePath("/admin"), redirect("/admin"). Sambungkan ke form di components/FormProduk.jsx dan app/admin/produk/baru/page.jsx. Hapus CatatanBelumAktif.

**Hasil:** Berhasil. Server Action `tambahProduk` memanggil `requireAdmin()` di awal. `FormProduk.jsx` menerima prop `action` dan memakai `useActionState` untuk menampilkan error dan state pending. `CatatanBelumAktif` dihapus dari halaman tambah produk.

### US-09 Ubah produk **[SENDIRI]**

**Prompt:** Ubah app/admin/produk/[id]/ubah/page.jsx supaya data lama diambil dari Supabase, bukan dari data contoh. Buat Server Action ubahProduk di app/admin/actions.js: wajib requireAdmin(), lalu update, revalidatePath, redirect. Hapus CatatanBelumAktif dan fungsi cariProdukContoh.

**Hasil:** Berhasil. Server Action `ubahProduk` ditambahkan dengan `requireAdmin()`. Halaman ubah produk mengambil data dari Supabase berdasarkan id dan `notFound()` jika tidak ada. Fungsi `cariProdukContoh` dihapus dari `lib/data-contoh.js`.

### US-10 Hapus produk **[SENDIRI]**

**Prompt:** Buat Server Action hapusProduk di app/admin/actions.js: wajib requireAdmin(), lalu delete berdasarkan id dari FormData, revalidatePath. Buat komponen TombolHapus.jsx yang meminta konfirmasi confirm() sebelum mengirim form. Sambungkan di TabelProduk.jsx.

**Hasil:** Berhasil. Server Action `hapusProduk` memanggil `requireAdmin()` dan menerima id dari FormData. Komponen baru `components/TombolHapus.jsx` (client component) menampilkan dialog konfirmasi sebelum menghapus. Tombol "Hapus" di `TabelProduk.jsx` diganti dengan `TombolHapus`.

### US-11 Filter kategori atau pencarian **[SENDIRI]**

**Prompt:** Tambahkan penyaring di halaman katalog: kolom pencarian nama produk dan pilihan kategori. Filter dijalankan di sisi server dari searchParams, memakai query Supabase ilike untuk nama dan eq untuk kategori. Gabungkan kategori unik untuk pilihan dropdown.

**Hasil:** Berhasil. `app/page.jsx` membaca `searchParams` (di-await untuk Next.js 16). Form penyaring berisi input teks untuk nama dan dropdown untuk kategori. Query Supabase menggunakan `.ilike("nama", ...)` dan `.eq("kategori", ...)`. Menampilkan pesan "tidak ada produk yang cocok" jika hasil filter kosong, atau "Belum ada produk" jika tabel memang kosong.

### US-12 Pilih jumlah atau varian **[SENDIRI]**

**Prompt:** (Dikerjakan secara terpisah) Buat komponen PilihJumlahPesan.jsx yang memungkinkan pengunjung memilih jumlah sebelum memesan. Jumlah dan total harga ditulis di pesan WhatsApp.

**Hasil:** Berhasil. Komponen `components/PilihJumlahPesan.jsx` (client component) menampilkan tombol +/- untuk memilih jumlah, menghitung total harga, dan mengirimkan pesan WhatsApp berisi nama produk, harga satuan, jumlah, dan total. Disambungkan di halaman detail produk menggantikan `TombolWhatsApp` langsung.

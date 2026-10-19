# Checklist Pengujian

Uji di link Vercel, bukan hanya di laptop. Coba juga di HP.

## Pengunjung

- [x] Katalog menampilkan semua produk dari database (bukan data contoh).
- [x] Harga tampil dalam format rupiah, misalnya Rp 45.000.
- [x] Klik kartu produk membuka halaman detail produk yang benar.
- [x] Alamat produk yang tidak ada (misalnya `/produk/9999`) menampilkan halaman "tidak ditemukan".
- [x] Tombol "Pesan via WhatsApp" membuka WhatsApp ke nomor toko dengan pesan berisi nama dan harga produk.
- [x] Tampilan rapi di HP: teks terbaca, tombol mudah ditekan, tidak ada yang terpotong.

## Admin

- [x] Login dengan email dan password yang benar berhasil masuk ke `/admin`.
- [x] Login dengan password salah menampilkan pesan error.
- [x] Ganti password berhasil, lalu login dengan password baru berhasil.
- [x] Password baru kurang dari 8 karakter atau tidak sama dengan konfirmasi ditolak dengan pesan yang jelas.
- [x] Tombol "Keluar" mengakhiri sesi.

## Bonus (jika dikerjakan)

- [x] Tambah produk: produk baru muncul di katalog.
- [x] Ubah produk: perubahan muncul di katalog.
- [x] Hapus produk: produk hilang dari katalog setelah konfirmasi.

import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk, jumlah = 1, pesan }) {
  const nomor = toko.nomorWhatsApp ? String(toko.nomorWhatsApp).replace(/\D/g, "") : "";
  const hargaSatuan = formatRupiah(produk?.harga || 0);
  const total = (produk?.harga || 0) * jumlah;
  const totalFormatted = formatRupiah(total);

  const teksPesan =
    pesan ||
    `Halo, saya ingin memesan ${produk?.nama} seharga ${hargaSatuan} sebanyak ${jumlah} (total ${totalFormatted}).`;
  const href = `https://wa.me/${nomor}?text=${encodeURIComponent(teksPesan)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}

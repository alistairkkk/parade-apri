import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const hargaFormatted = formatRupiah(produk.harga);
  const teksPesan = `Halo, saya ingin memesan ${produk.nama} seharga ${hargaFormatted}.`;
  const nomor = toko.nomorWhatsApp ? String(toko.nomorWhatsApp).replace(/\D/g, "") : "";
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

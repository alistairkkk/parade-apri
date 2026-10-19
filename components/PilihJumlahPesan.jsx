"use client";

import { useState } from "react";
import Tombol from "@/components/Tombol";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { formatRupiah } from "@/lib/format";

export default function PilihJumlahPesan({ produk }) {
  const [jumlah, setJumlah] = useState(1);

  const tambah = () => setJumlah((prev) => prev + 1);
  const kurang = () => setJumlah((prev) => Math.max(1, prev - 1));

  const hargaSatuan = formatRupiah(produk?.harga || 0);
  const total = (produk?.harga || 0) * jumlah;
  const totalFormatted = formatRupiah(total);

  const pesan = `Halo, saya ingin memesan ${produk?.nama} seharga ${hargaSatuan} sebanyak ${jumlah} (total ${totalFormatted}).`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-teks-lembut">Jumlah</span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Tombol
              type="button"
              varian="garis"
              onClick={kurang}
              disabled={jumlah <= 1}
              aria-label="Kurangi jumlah"
              className="h-10 w-10 !px-0 !py-0 text-lg disabled:cursor-not-allowed disabled:opacity-30"
            >
              -
            </Tombol>
            <span className="w-10 text-center text-lg font-bold text-teks select-none">
              {jumlah}
            </span>
            <Tombol
              type="button"
              varian="garis"
              onClick={tambah}
              aria-label="Tambah jumlah"
              className="h-10 w-10 !px-0 !py-0 text-lg"
            >
              +
            </Tombol>
          </div>
          <p className="text-sm text-teks-lembut">
            Total: <strong className="text-base font-bold text-teks">{totalFormatted}</strong>
          </p>
        </div>
      </div>

      <TombolWhatsApp produk={produk} jumlah={jumlah} pesan={pesan} />
    </div>
  );
}


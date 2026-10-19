"use client";

import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TombolHapus({ id, nama }) {
  function handleSubmit(e) {
    const pesan = nama
      ? `Apakah Anda yakin ingin menghapus produk "${nama}"?`
      : "Apakah Anda yakin ingin menghapus produk ini?";
    const setuju = window.confirm(pesan);
    if (!setuju) {
      e.preventDefault();
    }
  }

  return (
    <form action={hapusProduk} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya">
        Hapus
      </Tombol>
    </form>
  );
}


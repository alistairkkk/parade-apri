"use client";

import { useState, useTransition } from "react";
import { buatDeskripsiAI } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";

export default function GeneratorDeskripsiAI({ nama, kategori, onDeskripsiChange }) {
  const [pesanError, setPesanError] = useState("");
  const [isPending, startTransition] = useTransition();

  function buatDeskripsi() {
    setPesanError("");
    startTransition(async () => {
      const result = await buatDeskripsiAI({ nama, kategori });
      if (result.error) {
        setPesanError(result.error);
        return;
      }
      onDeskripsiChange(result.deskripsi);
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Tombol type="button" varian="garis" disabled={isPending || !nama.trim()} onClick={buatDeskripsi}>
        {isPending ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
      </Tombol>
      {pesanError && (
        <p role="alert" className="text-sm text-bahaya">
          {pesanError}
        </p>
      )}
    </div>
  );
}

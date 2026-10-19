"use client";

import { useEffect, useState } from "react";

export default function DaftarServiceWorker() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [terpasang, setTerpasang] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    function tangkapAjakanInstall(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function tandaiTerpasang() {
      setTerpasang(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", tangkapAjakanInstall);
    window.addEventListener("appinstalled", tandaiTerpasang);
    return () => {
      window.removeEventListener("beforeinstallprompt", tangkapAjakanInstall);
      window.removeEventListener("appinstalled", tandaiTerpasang);
    };
  }, []);

  async function pasangAplikasi() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  if (!installPrompt || terpasang) return null;

  return (
    <aside
      aria-label="Instal aplikasi"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-lg items-center justify-between gap-4 rounded-xl border border-garis bg-permukaan p-4 shadow-lg"
    >
      <p className="text-sm font-medium text-teks">Pasang Parade Ari di perangkat Anda.</p>
      <button
        type="button"
        onClick={pasangAplikasi}
        className="shrink-0 rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
      >
        Install app
      </button>
    </aside>
  );
}

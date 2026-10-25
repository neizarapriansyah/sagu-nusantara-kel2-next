"use client";

import { useEffect, useState } from "react";
import { DEFAULT_DATA } from "@/data/defaultData";
import { DB_KEY, SaguStore } from "@/lib/store";
import type { SaguData } from "@/lib/types";

// ambil data website dari localStorage (yang diatur lewat dashboard admin).
// render pertama pakai data awal supaya HTML server dan browser sama (tidak hydration error),
// lalu data asli dari localStorage dimuat setelah komponen tampil.
export function useSaguData(): SaguData {
  const [db, setDb] = useState<SaguData>(DEFAULT_DATA);

  useEffect(() => {
    setDb(SaguStore.load());

    // kalau admin nyimpen sesuatu di tab lain, halaman ini langsung ikut berubah
    const onStorage = (e: StorageEvent) => {
      if (e.key === DB_KEY) setDb(SaguStore.load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return db;
}

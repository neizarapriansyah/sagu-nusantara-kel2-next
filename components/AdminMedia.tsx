"use client";

import { useEffect, useRef, useState } from "react";
import { assetSrc } from "@/lib/util";

type AdminMediaProps = {
  src?: string;
  className?: string;
  // tulisan di kotak kalau gambarnya belum ada
  emptyLabel?: string;
};

// kotak gambar admin. kalau gambar kosong atau gagal dimuat, muncul tulisan nama file
// (pengganti SaguUtil.enableAssetPlaceholders di versi UTS)
export default function AdminMedia({ src = "", className = "", emptyLabel = "kosong" }: AdminMediaProps) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
    // gambar bisa saja sudah gagal dimuat sebelum React selesai hydrate
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  const missing = !src || failed;
  const label = !src ? emptyLabel : src.startsWith("data:") ? "gambar upload" : src.split("/").pop() || "gambar";

  return (
    <span className={`media ${className}${missing ? " is-missing" : ""}`} data-missing={missing ? label : undefined}>
      {src && <img ref={ref} src={assetSrc(src)} alt="" onError={() => setFailed(true)} onLoad={() => setFailed(false)} />}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { assetSrc } from "@/lib/util";

// kotak gambar, kalau gambarnya gagal dimuat muncul tulisan nama file (lihat .media.is-missing di admin.css)
export default function Media({
  src,
  className = "",
  missingText,
}: {
  src?: string;
  className?: string;
  missingText?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const url = assetSrc(src);
  const missing = !url || failed;
  const label = missingText ?? (url ? url.split("/").pop() : "kosong");

  return (
    <span className={`media ${className} ${missing ? "is-missing" : ""}`} data-missing={missing ? label : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url || undefined} alt="" onError={() => setFailed(true)} />
    </span>
  );
}

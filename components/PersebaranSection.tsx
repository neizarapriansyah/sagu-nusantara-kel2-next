"use client";

import { useEffect, useRef, useState } from "react";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import WilayahButton from "@/components/WilayahButton";
import WilayahDetail from "@/components/WilayahDetail";
import type { Region } from "@/lib/types";

type PersebaranSectionProps = {
  regions: Region[];
};

export default function PersebaranSection({ regions }: PersebaranSectionProps) {
  // activeId = tombol yang disorot, shownId = detail yang tampil (diganti setelah efek pudar)
  // awalnya belum ada wilayah yang dipilih
  const [activeId, setActiveId] = useState<string | null>(null);
  const [shownId, setShownId] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // kalau id wilayah tidak ada di data, anggap belum ada yang dipilih
  const ada = (id: string | null) => (regions.some((r) => r.id === id) ? id : null);
  const activeValid = ada(activeId);
  const shownValid = ada(shownId);

  const shownIndex = regions.findIndex((r) => r.id === shownValid);
  const shownRegion = shownIndex >= 0 ? regions[shownIndex] : null;

  function pilih(id: string) {
    // klik wilayah yang lagi aktif = tutup detailnya, balik ke tampilan awal
    const next = id === activeValid ? null : id;
    setActiveId(next);

    // efek pudar dikit pas ganti wilayah
    setChanging(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShownId(next);
      setChanging(false);
    }, 180);
  }

  return (
    <Section id="persebaran" name="persebaran">
      <SectionHeading
        eyebrow="Jelajahi Nusantara"
        title="Daerah Persebaran Sagu"
        subtitle="Klik salah satu wilayah di bawah untuk melihat informasinya."
      />

      <div className="persebaran-layout">
        <div className="wilayah-list" aria-label="Daftar wilayah">
          {regions.map((region) => (
            <WilayahButton
              key={region.id}
              region={region}
              active={region.id === activeValid}
              onSelect={() => pilih(region.id)}
            />
          ))}
        </div>

        <WilayahDetail
          region={shownRegion}
          index={shownIndex}
          total={regions.length}
          changing={changing}
        />
      </div>
    </Section>
  );
}

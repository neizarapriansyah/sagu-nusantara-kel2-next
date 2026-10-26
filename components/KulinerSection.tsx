"use client";

import { useMemo, useState } from "react";
import KulinerCard from "@/components/KulinerCard";
import KulinerDropdown from "@/components/KulinerDropdown";
import KulinerModal from "@/components/KulinerModal";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import type { Food, FoodOptions, Region } from "@/lib/types";

type KulinerSectionProps = {
  foods: Food[];
  regions: Region[];
  foodOptions: FoodOptions;
};

const unik = (list: string[]) => [...new Set(list.filter(Boolean))];

// pilihan yang tidak ada di daftar dikembalikan ke "Semua"
const validValue = (value: string, options: string[]) => (options.includes(value) ? value : "Semua");

export default function KulinerSection({ foods, regions, foodOptions }: KulinerSectionProps) {
  const [kata, setKata] = useState("");
  const [wilayah, setWilayah] = useState("Semua");
  const [kategori, setKategori] = useState("Semua");
  const [penyajian, setPenyajian] = useState("Semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const wilayahOptions = useMemo(
    () => unik([...regions.map((r) => r.name), ...foods.map((f) => f.region)]),
    [regions, foods]
  );
  const kategoriOptions = useMemo(
    () => unik([...foodOptions.kategori, ...foods.map((f) => f.category)]),
    [foodOptions, foods]
  );
  const penyajianOptions = useMemo(
    () => unik([...foodOptions.penyajian, ...foods.map((f) => f.servingType)]),
    [foodOptions, foods]
  );

  const wilayahAktif = validValue(wilayah, wilayahOptions);
  const kategoriAktif = validValue(kategori, kategoriOptions);
  const penyajianAktif = validValue(penyajian, penyajianOptions);

  const hasil = useMemo(() => {
    const q = kata.trim().toLowerCase();

    return foods.filter((f) => {
      const teks = [f.name, f.region, f.category, f.servingType, f.description, (f.ingredients || []).join(" ")]
        .join(" ")
        .toLowerCase();

      return (
        (!q || teks.includes(q)) &&
        (wilayahAktif === "Semua" || f.region === wilayahAktif) &&
        (kategoriAktif === "Semua" || f.category === kategoriAktif) &&
        (penyajianAktif === "Semua" || f.servingType === penyajianAktif)
      );
    });
  }, [foods, kata, wilayahAktif, kategoriAktif, penyajianAktif]);

  const selected = foods.find((f) => f.id === selectedId) ?? null;

  return (
    <Section id="kuliner-sagu" name="kuliner">
      <SectionHeading
        eyebrow="Ragam Rasa Nusantara"
        title="Kuliner Sagu Nusantara"
        subtitle="Cari tahu makanan sagu favoritmu berdasarkan nama ataupun daerah."
      />

      <div className="kuliner-filter">
        <div className="kuliner-search">
          <label htmlFor="kulinerSearch" className="kuliner-label">
            Cari Kuliner
          </label>
          <div className="kuliner-search-box">
            <svg className="kuliner-search-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m15.5 15.5 5 5" />
            </svg>
            <input
              type="search"
              id="kulinerSearch"
              placeholder="Nama makanan, daerah, atau bahan..."
              autoComplete="off"
              value={kata}
              onChange={(e) => setKata(e.target.value)}
            />
          </div>
        </div>

        <KulinerDropdown
          id="filterWilayah"
          label="Wilayah"
          value={wilayahAktif}
          options={wilayahOptions}
          onChange={setWilayah}
        />
        <KulinerDropdown
          id="filterKategori"
          label="Jenis"
          value={kategoriAktif}
          options={kategoriOptions}
          onChange={setKategori}
        />
        <KulinerDropdown
          id="filterPenyajian"
          label="Penyajian"
          value={penyajianAktif}
          options={penyajianOptions}
          onChange={setPenyajian}
        />
      </div>

      <p className="kuliner-info" aria-live="polite">
        {hasil.length === foods.length
          ? `Menampilkan ${foods.length} kuliner`
          : `Menampilkan ${hasil.length} dari ${foods.length} kuliner`}
      </p>

      <div className="kuliner-grid">
        {hasil.length === 0 ? (
          <p className="kuliner-empty">
            Kuliner yang kamu cari belum ada. Coba kata kunci lain atau ubah filternya.
          </p>
        ) : (
          hasil.map((food) => <KulinerCard key={food.id} food={food} onDetail={setSelectedId} />)
        )}
      </div>

      <KulinerModal food={selected} onClose={() => setSelectedId(null)} />
    </Section>
  );
}

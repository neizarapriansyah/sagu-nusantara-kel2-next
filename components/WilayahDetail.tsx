import ChipList from "@/components/ChipList";
import type { Region } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type WilayahDetailProps = {
  region: Region | null;
  index: number;
  total: number;
  changing: boolean;
};

// tampilan detail wilayah di sebelah kanan daftar (atau tampilan awal kalau belum ada yang dipilih)
export default function WilayahDetail({ region, index, total, changing }: WilayahDetailProps) {
  return (
    <div className={`wilayah-detail${changing ? " is-changing" : ""}`} aria-live="polite">
      {!region ? (
        <div className="wilayah-empty">
          <img src="/assets/images/logo-sagu.png" alt="" />
          <p>Pilih salah satu wilayah untuk melihat makanan khas dan fakta uniknya.</p>
        </div>
      ) : (
        <>
          <img
            className="wilayah-image"
            src={assetSrc(region.image)}
            alt={`Suasana wilayah ${region.name}`}
          />
          <div className="wilayah-box">
            <p className="wilayah-badge">
              Wilayah {index + 1} dari {total}
            </p>
            <h3 className="wilayah-title">{region.name}</h3>
            <p className="wilayah-text">{region.description}</p>

            <h4 className="wilayah-heading">Makanan Khas Sagu</h4>
            <ChipList items={region.foods || []} />

            <h4 className="wilayah-heading">Fakta Unik</h4>
            <p className="wilayah-text">{region.facts}</p>
          </div>
        </>
      )}
    </div>
  );
}

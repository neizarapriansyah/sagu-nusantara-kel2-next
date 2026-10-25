import type { Region } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type WilayahButtonProps = {
  region: Region;
  active: boolean;
  onSelect: () => void;
};

export default function WilayahButton({ region, active, onSelect }: WilayahButtonProps) {
  return (
    <button
      type="button"
      className={`wilayah-button${active ? " active" : ""}`}
      aria-pressed={active}
      onClick={onSelect}
    >
      <img className="wilayah-map" src={assetSrc(region.mapIcon)} alt="" />
      <span>{region.name}</span>
      <svg className="wilayah-arrow" viewBox="0 0 12 20" aria-hidden="true">
        <path d="M2 2l8 8-8 8" />
      </svg>
    </button>
  );
}

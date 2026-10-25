import type { Food } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type KulinerCardProps = {
  food: Food;
  onDetail: (id: string) => void;
};

export default function KulinerCard({ food, onDetail }: KulinerCardProps) {
  return (
    <article className="kuliner-card">
      <img className="kuliner-card-image" src={assetSrc(food.image)} alt={food.name} loading="lazy" />
      <div className="kuliner-card-box">
        <p className="kuliner-card-region">
          <svg viewBox="0 0 12 16" aria-hidden="true">
            <path d="M6 0a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6zm0 8.2A2.2 2.2 0 1 1 6 3.8a2.2 2.2 0 0 1 0 4.4z" />
          </svg>
          {food.region}
        </p>
        <h3 className="kuliner-card-title">{food.name}</h3>
        <p className="kuliner-card-desc">{food.description}</p>
        <div className="kuliner-card-tags">
          <span className="kuliner-tag">{food.servingType}</span>
          <span className="kuliner-tag">{food.category}</span>
        </div>
        <button type="button" className="kuliner-card-button" onClick={() => onDetail(food.id)}>
          Lihat Detail →
        </button>
      </div>
    </article>
  );
}

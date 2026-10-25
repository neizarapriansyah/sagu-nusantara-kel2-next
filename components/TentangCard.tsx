import type { AboutCard } from "@/lib/types";
import { assetSrc, pad } from "@/lib/util";

type TentangCardProps = {
  card: AboutCard;
  number: number;
};

export default function TentangCard({ card, number }: TentangCardProps) {
  return (
    <article className="tentang-card">
      <img className="tentang-card-image" src={assetSrc(card.image)} alt={card.title} />
      <div className="tentang-card-box">
        <p className="tentang-card-number">{pad(number)} —</p>
        <h3 className="tentang-card-title">{card.title}</h3>
        <p className="tentang-card-desc">{card.description}</p>
      </div>
    </article>
  );
}

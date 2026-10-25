import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import TentangCard from "@/components/TentangCard";
import type { AboutCard } from "@/lib/types";

type TentangSectionProps = {
  cards: AboutCard[];
};

export default function TentangSection({ cards }: TentangSectionProps) {
  return (
    <Section id="tentang-sagu" name="tentang">
      <SectionHeading eyebrow="Mengenal Lebih Jauh" title="Tentang Sagu" />

      <div className="tentang-grid">
        {cards.map((card, i) => (
          <TentangCard key={card.id} card={card} number={i + 1} />
        ))}
      </div>
    </Section>
  );
}

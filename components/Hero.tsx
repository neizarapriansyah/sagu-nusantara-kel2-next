import ButtonLink from "@/components/Button";
import Section from "@/components/Section";
import type { Settings } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type HeroProps = {
  settings: Settings;
};

export default function Hero({ settings }: HeroProps) {
  return (
    <Section id="beranda" name="hero">
      <div className="hero-text">
        <p className="hero-eyebrow">{settings.heroEyebrow}</p>
        <h1>{settings.siteName}</h1>
        <h2>{settings.tagline}</h2>
        <p className="hero-description">{settings.heroDescription}</p>

        <div className="hero-buttons">
          <ButtonLink href="#kuliner-sagu">Jelajahi Kuliner →</ButtonLink>
          <ButtonLink href="#tentang-sagu" variant="outline">
            Tentang Sagu
          </ButtonLink>
        </div>
      </div>

      <div className="hero-image">
        <img src={assetSrc(settings.heroImage)} alt="Hutan Sagu" />
      </div>
    </Section>
  );
}

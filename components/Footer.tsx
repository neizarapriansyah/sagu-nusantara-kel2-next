import type { Settings } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type FooterProps = {
  settings: Settings;
};

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <img className="footer-image" src={assetSrc(settings.footerImageLeft)} alt="Kebun pohon sagu" />

        <div className="footer-center">
          <a href="#beranda" className="footer-brand">
            <img src="/assets/images/logo-sagu.png" alt="" className="footer-logo" />
            <span className="footer-name">{settings.siteName}</span>
          </a>
          <p className="footer-text">{settings.footerText}</p>
          <p className="footer-copy">{settings.copyright}</p>
        </div>

        <img
          className="footer-image"
          src={assetSrc(settings.footerImageRight)}
          alt="Sagu basah dibungkus daun sagu"
        />
      </div>
    </footer>
  );
}

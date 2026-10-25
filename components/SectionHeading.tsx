type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  // section proses memakai kelas subjudul sendiri
  subtitleClassName?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  subtitleClassName = "section-subtitle",
}: SectionHeadingProps) {
  return (
    <>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
    </>
  );
}

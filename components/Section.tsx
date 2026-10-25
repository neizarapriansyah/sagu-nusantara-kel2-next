import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  // nama kelas section, misal "tentang" -> <section class="tentang"> berisi <div class="tentang-inner">
  name: string;
  children: ReactNode;
};

// pembungkus semua section di halaman: isi section dikirim lewat children
export default function Section({ id, name, children }: SectionProps) {
  return (
    <section className={name} id={id}>
      <div className={`${name}-inner`}>{children}</div>
    </section>
  );
}

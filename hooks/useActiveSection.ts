"use client";

import { useEffect, useState } from "react";

// menandai section mana yang sedang tampil di layar, dipakai untuk garis bawah menu navbar.
// section yang tidak ada di navbar (misal fakta menarik) tidak mengganti garis bawahnya.
export function useActiveSection(linkIds: readonly string[]): string {
  const [active, setActive] = useState<string>(linkIds[0]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && linkIds.includes(entry.target.id)) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [linkIds]);

  return active;
}

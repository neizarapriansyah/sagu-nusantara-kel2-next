"use client";

import { useEffect, useRef, useState } from "react";
import ProsesDetail from "@/components/ProsesDetail";
import ProsesStep from "@/components/ProsesStep";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import type { ProcessingStep } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type ProsesSectionProps = {
  steps: ProcessingStep[];
};

export default function ProsesSection({ steps }: ProsesSectionProps) {
  // active = tombol yang disorot, shown = isi detail yang tampil
  // (isi detail baru diganti setelah efek pudar 200ms selesai)
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [changing, setChanging] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const activeIndex = active >= steps.length ? 0 : active;
  const shownIndex = shown >= steps.length ? 0 : shown;
  const current = steps[shownIndex];

  // muat semua foto lebih dulu supaya pergantian foto tidak berkedip
  useEffect(() => {
    steps.forEach((step) => {
      new Image().src = assetSrc(step.image);
    });
  }, [steps]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function showStep(index: number) {
    if (index === activeIndex) return;
    setActive(index);
    setChanging(true);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(index);
      setChanging(false);
    }, 200);
  }

  return (
    <Section id="proses-pengolahan" name="proses">
      <SectionHeading
        eyebrow="Batang Menjadi Tepung?"
        title="Proses Pengolahan Sagu"
        subtitle="Klik setiap tahap untuk melihat penjelasan lengkapnya."
        subtitleClassName="proses-subtitle"
      />

      <div className="proses-steps">
        {steps.map((step, i) => (
          <ProsesStep
            key={step.id}
            step={step}
            active={i === activeIndex}
            onSelect={() => showStep(i)}
          />
        ))}
      </div>

      {current && (
        <ProsesDetail step={current} index={shownIndex} total={steps.length} changing={changing} />
      )}
    </Section>
  );
}

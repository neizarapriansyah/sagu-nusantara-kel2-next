import type { ProcessingStep } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type ProsesStepProps = {
  step: ProcessingStep;
  active: boolean;
  onSelect: () => void;
};

// satu tombol ikon pada deretan tahap pengolahan
export default function ProsesStep({ step, active, onSelect }: ProsesStepProps) {
  return (
    <button
      className={`proses-step${active ? " active" : ""}`}
      type="button"
      aria-pressed={active}
      onClick={onSelect}
    >
      <span className="proses-step-icon">
        <img src={assetSrc(step.icon)} alt="" />
      </span>
      <span className="proses-step-label">{step.title}</span>
    </button>
  );
}

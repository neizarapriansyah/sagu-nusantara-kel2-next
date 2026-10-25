import type { ProcessingStep } from "@/lib/types";
import { assetSrc, pad } from "@/lib/util";

type ProsesDetailProps = {
  step: ProcessingStep;
  index: number;
  total: number;
  changing: boolean;
};

// penjelasan lengkap dari tahap yang sedang dipilih
export default function ProsesDetail({ step, index, total, changing }: ProsesDetailProps) {
  return (
    <div className={`proses-detail${changing ? " is-changing" : ""}`}>
      <img className="proses-detail-image" src={assetSrc(step.image)} alt={step.title} />

      <div className="proses-detail-box">
        <p className="proses-detail-badge">
          Langkah {index + 1} dari {total}
        </p>
        <p className="proses-detail-number">
          {pad(index + 1)} — {step.title}
        </p>
        <h3 className="proses-detail-title">{step.title}</h3>
        <p className="proses-detail-desc">{step.description}</p>
      </div>
    </div>
  );
}

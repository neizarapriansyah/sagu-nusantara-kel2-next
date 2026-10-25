"use client";

import { useEffect, useRef } from "react";
import ChipList from "@/components/ChipList";
import type { Food } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type KulinerModalProps = {
  food: Food | null;
  onClose: () => void;
};

// popup detail kuliner, memakai elemen <dialog> bawaan browser
export default function KulinerModal({ food, onClose }: KulinerModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (food && !dialog.open) dialog.showModal();
    if (!food && dialog.open) dialog.close();
  }, [food]);

  return (
    <dialog
      ref={ref}
      className="kuliner-modal"
      aria-labelledby="kulinerModalTitle"
      onClose={onClose}
      // klik di luar kotak (area gelap) = tutup
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button type="button" className="kuliner-modal-close" aria-label="Tutup detail" onClick={onClose}>
        ×
      </button>

      <div className="kuliner-modal-box">
        {food && (
          <>
            <img className="kuliner-modal-image" src={assetSrc(food.image)} alt={food.name} />
            <div className="kuliner-modal-content">
              <p className="kuliner-modal-region">
                {food.region} · {food.category} · {food.servingType}
              </p>
              <h3 className="kuliner-modal-title" id="kulinerModalTitle">
                {food.name}
              </h3>
              <p className="kuliner-modal-text">{food.story}</p>

              <h4 className="kuliner-modal-heading">Bahan Utama</h4>
              <ChipList items={food.ingredients || []} />

              <h4 className="kuliner-modal-heading">Cara Pembuatan Singkat</h4>
              <p className="kuliner-modal-text">{food.preparation}</p>

              <h4 className="kuliner-modal-heading">Fakta Unik</h4>
              <p className="kuliner-modal-text">{food.fact}</p>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

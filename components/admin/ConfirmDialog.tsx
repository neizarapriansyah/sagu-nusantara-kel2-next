"use client";

import { useEffect, useRef } from "react";

export type ConfirmState = { message: string; okLabel: string; resolve: (ok: boolean) => void } | null;

// popup konfirmasi hapus / import / reset
export default function ConfirmDialog({ state }: { state: ConfirmState }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (state && !d.open) {
      d.returnValue = "";
      d.showModal();
    }
  }, [state]);

  return (
    <dialog ref={ref} className="admin-dialog admin-dialog--sm" id="confirmModal" aria-labelledby="confirmTitle"
      onClose={(e) => state?.resolve(e.currentTarget.returnValue === "ok")}>
      <form method="dialog" className="confirm">
        <h2 id="confirmTitle">Konfirmasi</h2>
        <p>{state?.message}</p>
        <div className="dialog-actions">
          <button value="cancel" className="btn btn--outline btn--sm" autoFocus>Batal</button>
          <button value="ok" className="btn btn--danger btn--sm">{state?.okLabel ?? "Hapus"}</button>
        </div>
      </form>
    </dialog>
  );
}

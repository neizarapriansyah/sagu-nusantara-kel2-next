"use client";

import { useEffect, useRef } from "react";

export type ConfirmRequest = {
  message: string;
  okLabel: string;
};

type AdminConfirmProps = {
  request: ConfirmRequest | null;
  // true kalau admin klik tombol ok, false kalau batal / ditutup
  onResolve: (ok: boolean) => void;
};

// popup konfirmasi hapus / import / reset
export default function AdminConfirm({ request, onResolve }: AdminConfirmProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (request && !dialog.open) {
      dialog.returnValue = "";
      dialog.showModal();
    }
  }, [request]);

  return (
    <dialog
      ref={ref}
      className="admin-dialog admin-dialog--sm"
      aria-labelledby="confirmTitle"
      onClose={(e) => onResolve(e.currentTarget.returnValue === "ok")}
    >
      <form method="dialog" className="confirm">
        <h2 id="confirmTitle">Konfirmasi</h2>
        <p>{request?.message}</p>
        <div className="dialog-actions">
          <button value="cancel" className="btn btn--outline btn--sm" autoFocus>
            Batal
          </button>
          <button value="ok" className="btn btn--danger btn--sm">
            {request?.okLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}

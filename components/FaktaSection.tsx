"use client";

import { useEffect, useRef, useState } from "react";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import VoteButton from "@/components/VoteButton";
import type { Fact } from "@/lib/types";
import { assetSrc } from "@/lib/util";

type FaktaSectionProps = {
  facts: Fact[];
};

type VoteType = "like" | "dislike";
type Votes = Record<string, VoteType>;

// pilihan like / dislike pengunjung disimpen terpisah dari data dashboard
// isinya kayak gini: { fc1: "like", fc4: "dislike" }
const VOTE_KEY = "webSagu_factVotes";
const LOGO = "/assets/images/logo-sagu.png";

function bacaVote(): Votes {
  try {
    return JSON.parse(localStorage.getItem(VOTE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function simpanVote(votes: Votes) {
  try {
    localStorage.setItem(VOTE_KEY, JSON.stringify(votes));
  } catch {
    /* kalau gagal ya udah, angkanya cuma ga kesimpen */
  }
}

export default function FaktaSection({ facts }: FaktaSectionProps) {
  const [shown, setShown] = useState(0); // fakta yang sedang tampil
  const [changing, setChanging] = useState(false);
  const [votes, setVotes] = useState<Votes>({});
  const [pop, setPop] = useState<VoteType | null>(null);
  const target = useRef(0); // fakta tujuan (kalau tombol ditekan cepat berkali-kali)
  const changeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const popTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const total = facts.length;
  const index = shown >= total ? 0 : shown;
  const fact: Fact | undefined = facts[index];
  const pilihan = fact ? votes[fact.id] : undefined;

  // pilihan pengunjung dibaca setelah tampil (localStorage hanya ada di browser)
  useEffect(() => {
    setVotes(bacaVote());
    const onStorage = (e: StorageEvent) => {
      if (e.key === VOTE_KEY) setVotes(bacaVote());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(changeTimer.current);
      clearTimeout(popTimer.current);
    },
    []
  );

  // muat foto fakta sebelum & sesudahnya biar pas diklik ga nunggu lama
  useEffect(() => {
    if (!total) return;
    [index - 1, index + 1].forEach((i) => {
      const f = facts[(i + total) % total];
      if (f?.image) new Image().src = assetSrc(f.image);
    });
  }, [facts, index, total]);

  function geser(arah: number) {
    if (total < 2) return;
    const dari = target.current >= total ? 0 : target.current;
    const tujuan = (dari + arah + total) % total;
    target.current = tujuan;

    setChanging(true);
    clearTimeout(changeTimer.current);
    changeTimer.current = setTimeout(() => {
      setShown(tujuan);
      setChanging(false);
    }, 200);
  }

  // klik sekali = pilih, klik lagi tombol yang sama = batal
  function pilih(jenis: VoteType) {
    if (!fact) return;

    const next: Votes = { ...votes };
    if (next[fact.id] === jenis) delete next[fact.id];
    else next[fact.id] = jenis;
    simpanVote(next);
    setVotes(next);

    if (next[fact.id] === jenis) {
      setPop(jenis);
      clearTimeout(popTimer.current);
      popTimer.current = setTimeout(() => setPop(null), 350);
    }
  }

  const kosong = total === 0;

  return (
    <Section id="fakta-menarik" name="fakta">
      <SectionHeading
        eyebrow="Tahukah Kamu?"
        title="Fakta Menarik"
        subtitle="Hal-hal kecil tentang sagu yang jarang diketahui."
      />

      <div className={`fakta-card${changing ? " is-changing" : ""}`}>
        <div className="fakta-photo">
          <img
            className="fakta-image"
            src={assetSrc(fact?.image) || LOGO}
            alt={fact?.text ?? ""}
          />
          <p className="fakta-counter">
            Fakta {kosong ? 0 : index + 1} dari {total}
          </p>
        </div>

        <div className="fakta-content">
          <p className="fakta-text" aria-live="polite">
            {fact ? fact.text : "Belum ada fakta."}
          </p>

          <div className="fakta-bottom">
            <div className="fakta-vote">
              <VoteButton
                icon="/assets/icons/like.png"
                label="Suka fakta ini"
                count={fact ? (fact.likes || 0) + (pilihan === "like" ? 1 : 0) : 0}
                active={pilihan === "like"}
                pop={pop === "like"}
                disabled={kosong}
                onClick={() => pilih("like")}
              />
              <VoteButton
                icon="/assets/icons/dislike.png"
                label="Tidak suka fakta ini"
                count={fact ? (fact.dislikes || 0) + (pilihan === "dislike" ? 1 : 0) : 0}
                active={pilihan === "dislike"}
                pop={pop === "dislike"}
                disabled={kosong}
                onClick={() => pilih("dislike")}
              />
            </div>

            <div className="fakta-nav">
              <button
                type="button"
                className="fakta-prev"
                aria-label="Fakta sebelumnya"
                disabled={total < 2}
                onClick={() => geser(-1)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={total < 2}
                onClick={() => geser(1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import type { Letter, Quiz } from "@/lib/types";
import { acak } from "@/lib/util";

type QuizSectionProps = {
  quizzes: Quiz[];
};

const LETTERS: Letter[] = ["A", "B", "C", "D"];

// quiz
// jawaban benar -> hijau, bisa lanjut. jawaban salah -> merah, bisa coba lagi
// tapi poinnya cuma dapet kalau benar di percobaan pertama
export default function QuizSection({ quizzes }: QuizSectionProps) {
  const [order, setOrder] = useState<Quiz[]>(quizzes);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [pernahSalah, setPernahSalah] = useState(false);
  const [chosen, setChosen] = useState<Letter | null>(null);
  const [finished, setFinished] = useState(false);
  const actionRef = useRef<HTMLButtonElement>(null);

  // soal diacak di browser (bukan di server) supaya tidak hydration error;
  // diulang tiap quiz dimulai lagi sehingga urutannya beda
  const mulaiUlang = useCallback((list: Quiz[]) => {
    setOrder(acak(list));
    setIndex(0);
    setScore(0);
    setPernahSalah(false);
    setChosen(null);
    setFinished(false);
  }, []);

  useEffect(() => {
    mulaiUlang(quizzes);
  }, [quizzes, mulaiUlang]);

  // tombol aksi (lanjut / coba lagi) langsung difokuskan setelah menjawab
  useEffect(() => {
    if (chosen !== null) actionRef.current?.focus({ preventScroll: true });
  }, [chosen]);

  const jumlah = order.length;
  const poin = Math.round(100 / Math.max(jumlah, 1));
  const q = order[index];

  function jawab(pilihan: Letter) {
    if (!q || chosen !== null) return;
    const benar = pilihan === q.correct;

    setChosen(pilihan);
    if (benar && !pernahSalah) setScore((s) => s + poin);
    if (!benar) setPernahSalah(true);
  }

  function aksi(mode: "next" | "retry" | "finish") {
    if (mode === "retry") setChosen(null);
    if (mode === "next") {
      setIndex((i) => i + 1);
      setPernahSalah(false);
      setChosen(null);
    }
    if (mode === "finish") setFinished(true);
  }

  function renderIsi() {
    if (!q) return <p className="quiz-question">Belum ada pertanyaan quiz.</p>;

    if (finished) {
      const max = poin * jumlah;
      const rasio = score / max;
      const pesan =
        rasio === 1
          ? "Sempurna! Kamu benar-benar paham tentang sagu Nusantara."
          : rasio >= 0.6
            ? "Bagus! Pengetahuanmu tentang sagu sudah cukup luas."
            : "Masih ada yang bisa dipelajari. Jelajahi lagi halaman ini lalu coba ulang quiznya.";

      return (
        <div className="quiz-result">
          <p className="quiz-result-label">Skor Akhir Kamu</p>
          <p className="quiz-result-score">
            {score}
            <small>/{max}</small>
          </p>
          <p className="quiz-result-text">{pesan}</p>
          <button type="button" className="btn btn-primary" onClick={() => mulaiUlang(quizzes)}>
            Ulangi Quiz
          </button>
        </div>
      );
    }

    const sudahJawab = chosen !== null;
    const benar = chosen === q.correct;
    const terakhir = index === jumlah - 1;
    const mode = !sudahJawab ? null : benar ? (terakhir ? "finish" : "next") : "retry";
    const label = {
      next: "Pertanyaan Berikutnya →",
      finish: "Lihat Skor Akhir",
      retry: "Coba Lagi",
    };

    let feedback = "";
    if (sudahJawab) {
      feedback = benar
        ? pernahSalah
          ? "Benar! Tapi poin cuma dihitung kalau benar di percobaan pertama."
          : "Benar! Jawaban kamu tepat."
        : "Jawaban kamu kurang tepat, coba lagi ya.";
    }

    return (
      <>
        <div className="quiz-top">
          <span className="quiz-badge">
            Pertanyaan {index + 1} dari {jumlah}
          </span>
          <span className="quiz-score">Skor: {score}</span>
        </div>
        <div className="quiz-progress">
          <span style={{ width: `${(index / jumlah) * 100}%` }} />
        </div>

        <p className="quiz-question">{q.question}</p>

        <div className="quiz-options">
          {LETTERS.map((h) => (
            <button
              key={h}
              type="button"
              className={`quiz-option${chosen === h ? (benar ? " benar" : " salah") : ""}`}
              disabled={sudahJawab}
              onClick={() => jawab(h)}
            >
              <span className="quiz-letter">{h}</span>
              <span>{q[`option${h}` as const]}</span>
            </button>
          ))}
        </div>

        <div className="quiz-bottom">
          <p className="quiz-feedback">{feedback}</p>
          {mode && (
            <button
              ref={actionRef}
              type="button"
              className={mode === "retry" ? "btn btn-outline" : "btn btn-primary"}
              onClick={() => aksi(mode)}
            >
              {label[mode]}
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <Section id="quiz" name="quiz">
      <SectionHeading
        eyebrow="Uji Pengetahuanmu"
        title="Quiz Sagu Nusantara"
        subtitle="Seberapa kenal kamu dengan sagu? Jawab pertanyaan di bawah ini!"
      />

      <div className="quiz-card" aria-live="polite">
        {renderIsi()}
      </div>
    </Section>
  );
}

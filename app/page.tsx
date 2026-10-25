"use client";

// halaman utama ("/"): semua section disusun di sini dan datanya dikirim lewat props
import { useEffect } from "react";
import FaktaSection from "@/components/FaktaSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import KulinerSection from "@/components/KulinerSection";
import Navbar from "@/components/Navbar";
import Pembatas from "@/components/Pembatas";
import PersebaranSection from "@/components/PersebaranSection";
import ProsesSection from "@/components/ProsesSection";
import QuizSection from "@/components/QuizSection";
import TentangSection from "@/components/TentangSection";
import { useSaguData } from "@/hooks/useSaguData";

export default function HomePage() {
  const db = useSaguData();

  // judul tab browser ikut nama website yang diatur di dashboard
  useEffect(() => {
    document.title = db.settings.siteName;
  }, [db.settings.siteName]);

  return (
    <>
      <Navbar siteName={db.settings.siteName} />

      <main>
        <Hero settings={db.settings} />
        <Pembatas />
        <TentangSection cards={db.aboutCards} />
        <Pembatas />
        <ProsesSection steps={db.processingSteps} />
        <Pembatas />
        <KulinerSection foods={db.foods} regions={db.regions} foodOptions={db.foodOptions} />
        <Pembatas />
        <PersebaranSection regions={db.regions} />
        <Pembatas />
        <FaktaSection facts={db.facts} />
        <Pembatas />
        <QuizSection quizzes={db.quizzes} />
      </main>

      <Pembatas />
      <Footer settings={db.settings} />
    </>
  );
}

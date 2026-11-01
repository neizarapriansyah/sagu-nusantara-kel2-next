// halaman utama ("/"): semua section disusun di sini dan datanya dikirim lewat props
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
import { getSaguData } from "@/lib/repository";

// data dibaca dari database SQLite setiap halaman dibuka, jadi perubahan dari
// dashboard admin langsung tampil di website tanpa build ulang
export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getSaguData();

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

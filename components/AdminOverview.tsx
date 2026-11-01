import { COLLECTION_KEYS } from "@/lib/collections";
import { MODULES, regionOptions, unique } from "@/lib/adminModules";
import type { ActivityLog, SaguData } from "@/lib/types";

type AdminOverviewProps = {
  data: SaguData;
  user: string;
  activity: ActivityLog[];
  onAction: (action: "export" | "import" | "reset" | "clear-log") => void;
};

const timeFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : timeFormatter.format(d);
};

// halaman ringkasan: sambutan, jumlah konten, aktivitas terbaru, grafik kuliner per wilayah, kelola data
export default function AdminOverview({ data, user, activity, onAction }: AdminOverviewProps) {
  // hitung jumlah kuliner tiap wilayah buat grafik
  const names = unique([...regionOptions(data), ...data.foods.map((f) => f.region)]);
  const counts = names.map((name) => ({ name, n: data.foods.filter((f) => f.region === name).length }));
  const max = Math.max(1, ...counts.map((c) => c.n));

  return (
    <>
      <section className="welcome">
        <div className="welcome__text">
          <p className="welcome__eyebrow">Selamat datang kembali</p>
          <h2 className="welcome__title">Halo, {user || "admin"}!</h2>
          <p className="welcome__desc">
            Semua isi website {data.settings.siteName} bisa kamu atur dari sini, mulai dari kartu tentang sagu sampai soal quiz.
          </p>
        </div>
        <img className="welcome__logo" src="/assets/images/logo-sagu.png" alt="" />
      </section>

      <section className="stats" aria-label="Statistik konten">
        {COLLECTION_KEYS.map((key) => (
          <a key={key} className="stat" href={`#${key}`}>
            <span className="stat__num">{data[key].length}</span>
            <span className="stat__label">{MODULES[key].title}</span>
          </a>
        ))}
      </section>

      <div className="dash-grid">
        <section className="panel dash-grid__activity">
          <div className="panel__head">
            <h2 className="panel__title">Aktivitas terbaru</h2>
            {activity.length > 0 && (
              <button type="button" className="btn btn--outline btn--xs" onClick={() => onAction("clear-log")}>
                Bersihkan
              </button>
            )}
          </div>

          {activity.length ? (
            <ol className="activity">
              {activity.map((a) => (
                <li key={a.id} className="activity__item">
                  <span className="activity__badge" data-type={a.action}>
                    {a.action}
                  </span>
                  <div className="activity__body">
                    <p>{a.detail}</p>
                    <small>
                      <span>{a.module}</span>
                      <time dateTime={a.time}>{formatTime(a.time)}</time>
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-note">Belum ada aktivitas. Setiap perubahan yang disimpan akan tercatat di sini.</p>
          )}
        </section>

        <section className="panel">
          <h2 className="panel__title">Kuliner per wilayah</h2>
          <ul className="bars">
            {counts.map((c) => (
              <li key={c.name} className="bar">
                <span className="bar__label">{c.name}</span>
                <span className="bar__track">
                  <span className="bar__fill" style={{ width: `${(c.n / max) * 100}%` }}></span>
                </span>
                <span className="bar__value">{c.n}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2 className="panel__title">Kelola data</h2>
          <p className="panel__note">Simpan cadangan seluruh konten sebagai file JSON, atau pulihkan dari file cadangan.</p>
          <div className="data-tools">
            <button type="button" className="btn btn--primary btn--sm" onClick={() => onAction("export")}>
              Export JSON
            </button>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => onAction("import")}>
              Import JSON
            </button>
            <button type="button" className="btn btn--danger btn--sm" onClick={() => onAction("reset")}>
              Kembalikan data awal
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

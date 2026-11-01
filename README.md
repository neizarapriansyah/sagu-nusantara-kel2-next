# Sagu Nusantara (Next.js)

Konversi website Sagu Nusantara (HTML/CSS/JS) ke Next.js (App Router + TypeScript), lengkap dengan dashboard admin.
Front-End UTS Project - Kelompok 02.

Progress saat ini: **main page** dan **dashboard admin** sudah dikonversi. Data website sekarang
disimpan di **SQLite** (bukan lagi `localStorage`) dan struktur tabelnya disiapkan agar mudah
dipindah ke Postgres lewat Prisma.

## Cara menjalankan

Gambar dan ikon sudah ada di `public/assets/` (`images/` dan `icons/`). Tinggal install dan jalankan:

```bash
npm install
npm run dev      # buka http://localhost:3000
npm run build    # build produksi
```

Database SQLite dibuat otomatis di `storage/sagu.db` saat pertama kali dibuka dan langsung diisi
data awal dari `data/defaultData.ts`. Pengaturan opsional ada di `.env.example` (salin jadi `.env`).

## Dashboard admin

- Login: `/admin/login` (atau ikon gerigi di navbar). Akun bawaan sama seperti versi UTS:
  username `admin`, password `sagu123` (ganti lewat `ADMIN_USERNAME` / `ADMIN_PASSWORD` di `.env`).
- Dashboard: `/admin/dashboard`, berpindah menu lewat `#hash` seperti versi UTS.
- Fitur sama dengan versi UTS: CRUD semua konten, upload gambar (otomatis dikecilkan), tambah opsi
  dropdown, urutan tahap proses, pengaturan website, ringkasan + aktivitas, export / import / reset JSON.
- Gambar upload disimpan sebagai file di `storage/uploads/` dan dilayani lewat `/api/uploads/...`.
- Sesi login memakai cookie httpOnly bertanda tangan (berlaku 8 jam). Ganti `SESSION_SECRET` saat deploy.

## Pindah ke Postgres + Prisma

Semua query ada di `lib/repository.ts` (tidak ada SQL di komponen atau route), skema tabel ada di
`lib/db.ts`. Saat memakai Prisma, buat model dengan nama kolom yang sama, lalu isi ulang fungsi di
`lib/repository.ts` dengan `prisma.*`. Kolom daftar (`ingredients`, `foods`) saat ini berupa teks JSON
dan bisa dijadikan `String[]` / `Json` di Postgres.

## Struktur

```
app/
  layout.tsx          layout global (font, metadata, globals.css)
  page.tsx            halaman utama "/" (menyusun semua section, data dikirim lewat props)
  globals.css         seluruh CSS (dari style.css)
components/
  Section.tsx         pembungkus section (memakai children)
  SectionHeading.tsx  eyebrow + judul + subjudul
  Navbar.tsx  Hero.tsx  Footer.tsx  Pembatas.tsx  Button.tsx  ChipList.tsx
  TentangSection.tsx  TentangCard.tsx
  ProsesSection.tsx   ProsesStep.tsx  ProsesDetail.tsx
  KulinerSection.tsx  KulinerCard.tsx  KulinerDropdown.tsx  KulinerModal.tsx
  PersebaranSection.tsx  WilayahButton.tsx  WilayahDetail.tsx
  FaktaSection.tsx    VoteButton.tsx
  QuizSection.tsx
hooks/
  useActiveSection.ts garis bawah menu navbar mengikuti section yang tampil
app/admin/
  layout.tsx          pembungkus .admin-root + admin.css (CSS admin dibatasi supaya tidak bentrok)
  login/page.tsx      halaman login
  dashboard/page.tsx  halaman dashboard (sesi dicek di server)
app/api/
  admin/...           route API admin (login, logout, data, collections, settings, import, dst)
  uploads/[name]      melayani gambar upload
components/ (admin)
  AdminDashboard.tsx  AdminSidebar.tsx  AdminOverview.tsx  AdminModuleView.tsx  AdminSettingsView.tsx
  AdminFormModal.tsx  AdminField.tsx  AdminConfirm.tsx  AdminLoginForm.tsx  AdminMedia.tsx
lib/
  types.ts  util.ts   (tipe data + fungsi kecil, port dari data.js)
  db.ts seed.ts       koneksi SQLite, skema tabel, data awal
  repository.ts       seluruh query database (titik pindah ke Prisma)
  collections.ts      definisi tabel/kolom + validasi kiriman form
  auth.ts uploads.ts  sesi login, penyimpanan gambar upload
  adminApi.ts adminClient.ts  pembungkus route API (server) dan pemanggil API (browser)
  adminModules.tsx adminForm.ts  konfigurasi menu/form/tabel dashboard + fungsi form
data/
  defaultData.ts      data website (dari data.js)
```

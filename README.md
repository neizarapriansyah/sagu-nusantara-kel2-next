# Sagu Nusantara (Next.js)

Konversi website Sagu Nusantara (HTML/CSS/JS) ke Next.js (App Router + TypeScript), lengkap dengan dashboard admin.
Front-End UTS Project - Kelompok 02.

Progress saat ini: **main page** dan **dashboard admin** sudah dikonversi. Data website sekarang
disimpan di **Prisma Postgres** (database PostgreSQL online) lewat **Prisma ORM**, bukan lagi `localStorage`.

## Cara menjalankan di laptop sendiri (untuk anggota kelompok)

Yang perlu ada di laptop: **Node.js 20 atau lebih baru** dan **Git**.

1. Ambil project lalu install. `npm install` juga otomatis membuat Prisma Client di folder `generated/`.

```bash
git clone https://github.com/neizarapriansyah/sagu-nusantara-kel2-next.git
cd sagu-nusantara-kel2-next
npm install
```

2. Salin `.env.example` jadi `.env`, lalu isi `DATABASE_URL` dan `DIRECT_URL`.
   Minta isinya ke pemegang database kelompok lewat chat pribadi. **Jangan** di-commit ke Git
   (`.env` sudah ada di `.gitignore`). Semua anggota memakai database yang sama, jadi data yang
   ditambah satu orang langsung terlihat oleh yang lain.

3. Jalankan:

```bash
npm run dev      # buka http://localhost:3000
```

Tidak perlu `db:deploy` atau `db:seed`: tabel dan data awal sudah ada di database kelompok.

### Perintah database (hati-hati)

```bash
npm run db:deploy   # membuat tabel sesuai prisma/migrations (aman dijalankan ulang)
npm run db:seed     # MENGHAPUS semua konten lalu mengisi ulang data awal dari data/defaultData.ts
npm run db:migrate  # setelah mengubah prisma/schema.prisma; commit folder prisma/migrations
npx prisma studio   # lihat dan edit isi tabel lewat browser
```

`db:seed` dan tombol Reset di dashboard mengosongkan data **semua anggota**, karena databasenya dipakai bersama.

### Membuat database baru (cukup satu orang)

1. Di [Prisma Console](https://console.prisma.io) buat project + database Prisma Postgres (region Singapore).
2. Buka database → **Connect to your database** → **Generate new connection string**. Salin alamat
   pooled ke `DATABASE_URL` dan alamat direct ke `DIRECT_URL`.
3. Jalankan `npm run db:deploy` lalu `npm run db:seed`, kemudian bagikan isi `.env` ke anggota lain.

## Dashboard admin

- Login: `/admin/login` (atau ikon gerigi di navbar). Akun bawaan sama seperti versi UTS:
  username `admin`, password `sagu123` (ganti lewat `ADMIN_USERNAME` / `ADMIN_PASSWORD` di `.env`).
- Dashboard: `/admin/dashboard`, berpindah menu lewat `#hash` seperti versi UTS.
- Fitur sama dengan versi UTS: CRUD semua konten, upload gambar (otomatis dikecilkan), tambah opsi
  dropdown, urutan tahap proses, pengaturan website, ringkasan + aktivitas, export / import / reset JSON.
- Gambar upload disimpan sebagai file di `storage/uploads/` **di laptop masing-masing** (tidak masuk database
  maupun Git), lalu dilayani lewat `/api/uploads/...`. Gambar yang di-upload anggota lain tidak akan tampil di laptopmu.
- Sesi login memakai cookie httpOnly bertanda tangan (berlaku 8 jam). Ganti `SESSION_SECRET` saat deploy.

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
  prisma.ts seed.ts   koneksi Prisma + fungsi isi ulang data
  repository.ts       seluruh query database (semua fungsi async)
  collections.ts      definisi tabel/kolom + validasi kiriman form
  auth.ts uploads.ts  sesi login, penyimpanan gambar upload
  adminApi.ts adminClient.ts  pembungkus route API (server) dan pemanggil API (browser)
  adminModules.tsx adminForm.ts  konfigurasi menu/form/tabel dashboard + fungsi form
prisma/
  schema.prisma  seed.ts  migrations/   skema database, data awal, riwayat migrasi
prisma.config.ts      konfigurasi Prisma CLI
data/
  defaultData.ts      data website (dari data.js)
```

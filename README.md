# Usher Event

Aplikasi absensi dan arsip event training usher tahunan. Data kehadiran
tersimpan langsung ke database Cloudflare D1 tanpa spreadsheet atau Excel.

## Fitur

- Pilihan event aktif pada halaman publik
- Form check-in menggunakan nama lengkap dan NIJ
- Tanggal dan jam live Asia/Jakarta yang tersimpan otomatis
- Pencegahan check-in ganda per NIJ dan event
- Nama dan NIJ disensor pada daftar kehadiran publik
- Halaman admin terproteksi untuk membuat dan menutup event
- Arsip event tahunan dengan data kehadiran lengkap
- Penghapusan absensi hanya tersedia untuk admin
- Database online D1 dengan migrasi tersimpan di repository

## Menjalankan secara lokal

Gunakan Node.js 22.13 atau lebih baru dan pnpm.

```bash
pnpm install
pnpm dev
```

Aplikasi akan tersedia di `http://localhost:3000`.

## Database

Skema utama berada di `db/schema.ts`, dan migrasi SQL berada di folder
`drizzle/`. Database lokal dibuat oleh lingkungan pengembangan Cloudflare.

## Perintah

```bash
pnpm dev          # server pengembangan
pnpm build        # build produksi
pnpm lint         # pemeriksaan kode
pnpm db:generate  # membuat migrasi setelah perubahan skema
```

## Privasi

Nama dan ID peserta hanya digunakan untuk administrasi kehadiran training.
Aplikasi hanya menampilkan nama dan NIJ yang telah disensor kepada publik.
Data lengkap dan fungsi penghapusan hanya tersedia di halaman admin.

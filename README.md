# Basic Training & Tools Usher

Aplikasi absensi online untuk peserta sesi **Basic Training** dan **Tools Usher**.
Data kehadiran tersimpan langsung ke database Cloudflare D1, tanpa spreadsheet
atau proses ekspor Excel.

## Fitur

- Form check-in yang responsif untuk ponsel dan desktop
- Validasi data di browser dan server
- Pencegahan absensi ganda berdasarkan ID, sesi, dan tanggal
- Waktu check-in menggunakan zona waktu Asia/Jakarta
- Jumlah kehadiran hari ini secara otomatis
- Halaman konfirmasi setelah data berhasil tersimpan
- Database online D1 dengan migrasi yang ikut tersimpan di repository

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
Aplikasi tidak menampilkan daftar data pribadi peserta kepada publik.

# Billboard Traffic Intelligence Dashboard — Project Overview

## 1. Latar Belakang & Tujuan
Dashboard untuk menampilkan **traffic intelligence** di sekitar titik-titik Billboard di seluruh Indonesia. Tujuannya adalah demo yang bisa diakses oleh Pradana (owner) dan klien, untuk menunjukkan potensi value dari data traffic + demografi di sekitar lokasi billboard — sebagai alat bantu penjualan/presentasi ke klien iklan luar ruang (OOH advertising).

**Status:** Demo / Proof of Concept (bukan produksi, belum terhubung ke sensor/CCTV nyata)

## 2. Target Pengguna
- **Internal (Pradana / tim):** mengelola & memverifikasi data titik billboard.
- **Klien:** melihat performa traffic & demografi di titik billboard yang relevan untuk mereka (read-only).

## 3. Scope Demo
- Jumlah titik billboard: **puluhan–ratusan titik**, tersebar di beberapa kota/wilayah Indonesia.
- Data traffic & demografi: **dummy/simulasi** (data generator, bukan real-time sensor).
- Tidak ada integrasi backend database awalnya — data bisa berupa JSON/mock yang di-generate, dengan struktur yang mudah diganti ke API nyata nanti.

## 4. Fitur Utama

### 4.1 Peta Interaktif (Map View)
- Menggunakan **Google Maps (free tier)** — markers/pins untuk tiap titik billboard.
- Karena titiknya puluhan-ratusan, pakai **marker clustering** supaya peta tetap enak dilihat saat zoom out.
- Klik marker → buka panel detail billboard tersebut (lihat 4.2).
- Warna/ikon marker bisa merepresentasikan level traffic (misal: rendah/sedang/tinggi) agar klien cepat menangkap insight secara visual.

### 4.2 Detail per Billboard
Saat satu titik billboard diklik, tampilkan panel/drawer berisi:
- Info lokasi (nama, alamat, koordinat, foto placeholder jika ada)
- Grafik traffic per kategori: **motor, mobil, pejalan kaki, truk**
- Ringkasan demografi sekitar wilayah (estimasi usia, kepadatan penduduk, dll — dummy)
- Filter waktu khusus untuk titik tersebut

### 4.3 Filter Waktu
- Filter global (mempengaruhi peta & grafik): harian, mingguan, dan custom date range.
- Default: data 7 hari terakhir.

### 4.4 Perbandingan Antar Billboard / Wilayah
- Pengguna bisa memilih 2+ titik billboard untuk dibandingkan side-by-side (grafik traffic per kategori).
- Bisa juga perbandingan agregat per wilayah/kota.

### 4.5 Export Laporan
- Export ke **PDF** (ringkasan visual, cocok untuk dikirim ke klien) dan **Excel** (data mentah/tabel).
- Scope: export per billboard atau per hasil filter yang sedang aktif.

### 4.6 Sidebar Navigasi
- Sidebar kiri: menu utama (Dashboard/Map, Daftar Billboard, Perbandingan, Laporan, Pengaturan).
- Layout bersih, **light mode** saja untuk demo ini (dark mode belum perlu).

## 5. Tech Stack

| Layer | Pilihan | Catatan |
|---|---|---|
| Frontend | **React** (Vite) | SPA, cepat untuk demo |
| Styling/UI | Tailwind CSS + komponen UI (shadcn/ui) | Clean, modern, konsisten |
| Map | **Google Maps JavaScript API** (free tier) | Perlu API key gratis (ada kuota bulanan dari Google, cukup untuk demo). Alternatif tanpa API key sama sekali: Leaflet + OpenStreetMap — bisa didiskusikan jika mau benar-benar $0 tanpa setup billing Google. |
| Chart | Recharts atau Chart.js | Untuk grafik traffic per kategori |
| Data Dummy | Generator data lokal (seed-based, konsisten tiap reload) | Disimpan sebagai JSON/TS mock, strukturnya dibuat semirip mungkin dengan bentuk API nyata nanti |
| State Management | React Query / Zustand (ringan) | Secukupnya untuk demo |
| Export PDF/Excel | `jspdf` / `html2canvas` (PDF), `xlsx` (Excel) | Generate di client-side, tanpa backend |
| Deployment Demo | Vercel / Netlify (gratis) | Supaya klien bisa akses via link |

> **Catatan Google Maps gratis:** Google Maps JS API butuh API key & akun Google Cloud (billing account tetap perlu didaftarkan walau ada free credit ~$200/bulan, biasanya cukup untuk traffic demo). Kalau ingin **tanpa setup billing sama sekali**, alternatifnya Leaflet + OpenStreetMap (gratis penuh, tanpa API key). Perlu dikonfirmasi mana yang Pradana mau pakai.

## 6. Struktur Data (Mock)

### Billboard
```ts
{
  id: string
  nama: string
  alamat: string
  kota: string
  provinsi: string
  lat: number
  lng: number
  levelTraffic: "rendah" | "sedang" | "tinggi" // untuk warna marker
}
```

### Traffic Record (per billboard, per periode)
```ts
{
  billboardId: string
  tanggal: string // ISO date
  motor: number
  mobil: number
  pejalanKaki: number
  truk: number
}
```

### Demografi (per billboard/wilayah)
```ts
{
  billboardId: string
  totalPenduduk: number
  kepadatanPerKm2: number
  distribusiUsia: { "0-17": number, "18-24": number, "25-34": number, "35-54": number, "55+": number } // persen
  estimasiPendapatan: "rendah" | "menengah" | "tinggi"
}
```

## 7. Halaman / Routing

| Route | Deskripsi |
|---|---|
| `/` atau `/dashboard` | Map view utama + ringkasan KPI (total billboard, rata-rata traffic, dll) |
| `/billboard` | Daftar semua titik billboard (tabel + search/filter) |
| `/billboard/:id` | Detail billboard (traffic, demografi, grafik) |
| `/compare` | Perbandingan antar billboard/wilayah |
| `/reports` | Riwayat/generate laporan export |

## 8. Hal yang Masih Perlu Diputuskan
- [ ] Google Maps (perlu API key + billing account) vs Leaflet/OpenStreetMap (gratis penuh tanpa setup)?
- [ ] Apakah perlu login/auth untuk klien (per-klien hanya lihat billboard miliknya), atau demo publik tanpa login dulu?
- [ ] Nama proyek/branding untuk demo ini?
- [ ] Daftar kota/wilayah contoh yang mau dipakai untuk data dummy (misal: Jakarta, Surabaya, Bandung, dll)?

## 9. Milestone Demo
1. Setup project React + Tailwind + struktur mock data generator
2. Map view dengan clustering + sidebar + filter waktu
3. Panel detail billboard (traffic + demografi + grafik)
4. Fitur perbandingan antar billboard
5. Export PDF/Excel
6. Polish UI (light mode, clean) + deploy ke Vercel untuk diakses klien

## 10. Pembagian Kerja untuk Multi-Agent

Supaya bisa dikerjakan paralel oleh beberapa agent tanpa saling tabrakan file, kerjaan dipecah per **route/komponen** dengan satu fondasi bersama yang harus selesai duluan.

### 10.0 Agent 0 — Foundation (wajib selesai duluan, blocking semua agent lain)
Scope:
- Scaffold project (Vite + React + TypeScript + Tailwind + shadcn/ui)
- Routing skeleton (semua path di bagian 7, boleh masih halaman kosong)
- **Shared types** (`src/types/*.ts`): `Billboard`, `TrafficRecord`, `Demografi` (sesuai bagian 6)
- **Mock data generator** (`src/lib/mockData.ts`): fungsi `getBillboards()`, `getTrafficByBillboard(id, range)`, `getDemografiByBillboard(id)` — seed-based biar konsisten tiap reload
- Layout dasar: Sidebar + top bar (komponen `<AppLayout>`), light mode theme/Tailwind config
- Keputusan teknis dari bagian 8 (Google Maps vs Leaflet, auth atau tidak) sudah final sebelum agent lain mulai

Output: semua agent lain tinggal `import` dari `src/types` dan `src/lib/mockData`, dan pakai `<AppLayout>` yang sudah ada — tidak perlu nunggu/nebak struktur data.

### 10.1 Agent 1 — Dashboard & Map (`/`, `/dashboard`)
- Peta (Google Maps/Leaflet) dengan marker clustering, warna marker per level traffic
- Panel KPI ringkasan di atas/sidebar kanan (total billboard, rata-rata traffic, dll)
- Filter waktu global (harian/mingguan/custom range) — state-nya reusable biar dipakai juga oleh Agent 2
- Klik marker → trigger buka panel detail (bisa panggil komponen dari Agent 2, atau navigate ke `/billboard/:id`)

### 10.2 Agent 2 — Detail Billboard (`/billboard`, `/billboard/:id`)
- Tabel/list semua billboard (search, sort, filter kota/wilayah)
- Panel/drawer detail: grafik traffic per kategori (motor, mobil, pejalan kaki, truk), ringkasan demografi
- Pakai komponen filter waktu yang sama dengan Agent 1 (dari foundation) biar konsisten

### 10.3 Agent 3 — Perbandingan (`/compare`)
- UI pilih 2+ billboard atau wilayah
- Grafik perbandingan side-by-side per kategori traffic
- Reuse chart components kalau Agent 2 sudah bikin duluan (atau dikoordinasikan untuk extract ke `src/components/charts/` dari awal)

### 10.4 Agent 4 — Laporan & Export (`/reports`)
- Generate export PDF (ringkasan visual) dan Excel (data mentah) dari hasil filter aktif atau per billboard
- Halaman riwayat/daftar laporan yang pernah di-generate (bisa disimpan di local state/localStorage untuk demo)

### Aturan Kerja Bareng
- Tiap agent kerja di file/folder-nya sendiri (`src/pages/dashboard/`, `src/pages/billboard/`, `src/pages/compare/`, `src/pages/reports/`) supaya minim konflik merge
- Komponen yang dipakai bersama (chart, card, badge level-traffic) ditaruh di `src/components/shared/` — kalau ada agent yang butuh duluan, boleh bikin versi sederhana dulu, nanti di-refine
- Semua agent **wajib** pakai types & mock data dari foundation, jangan bikin struktur data sendiri-sendiri
- Setelah semua agent selesai, ada 1 tahap integrasi: cek routing nyambung semua, state filter waktu konsisten antar halaman, lalu baru deploy ke Vercel

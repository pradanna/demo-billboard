# NexTraffic OOH - Indonesian Billboard Traffic & Audience Intelligence Dashboard

Platform Traffic Intelligence interaktif berbasis data pergerakan kendaraan, pejalan kaki, dan profil demografi di sekitar titik-titik billboard/videotron di seluruh Indonesia.

---

## 🚀 Cara Akses Demo

Aplikasi saat ini telah aktif dan dapat diakses melalui:

- **Akses Langsung di Komputer Ini:**  
  👉 **[http://localhost:5180](http://localhost:5180)**

- **Akses Bersama Klien di Jaringan Wi-Fi / Kantor yang Sama:**  
  👉 **[http://192.168.18.156:5180](http://192.168.18.156:5180)**  
  *(Dapat dibuka via browser laptop, tablet, atau smartphone)*

- **Akses Jarak Jauh (Public URL via Cloudflare Tunnel):**  
  Jalankan perintah ini di terminal baru untuk mendapatkan URL HTTPS publik gratis:  
  ```bash
  npx cloudflared tunnel --url http://localhost:5180
  ```

---

## 📊 Fitur Utama Dashboard

### 1. Klasifikasi 4 Kategori Moda Lalu Lintas (Sesuai Permintaan)
- 🏍️ **Sepeda Motor:** Volume kendaraan roda dua, komuter harian, kurir ojol instan.
- 🚗 **Mobil Penumpang:** Kendaraan pribadi roda empat & taksi online.
- 🚶 **Pejalan Kaki (Pedestrians):** Footfall penyeberang jalan, trotoar, halte MRT/TransJakarta, dan mall.
- 🚚 **Truk & Kendaraan Berat:** Armada logistik, kargo barang, dan bus komersial/pariwisata.

### 2. Demografi Lengkap Wilayah Sekitar Billboard
- **Distribusi Gender:** Rasio audiens Pria vs Wanita.
- **Kelompok Usia:** Rentang 18-24 (Gen Z/Mahasiswa), 25-34 (Young Professionals), 35-44 (Senior Executives), 45-54, 55+.
- **Status Sosial Ekonomi (SES) & Daya Beli:** SES A+ (> Rp 30 Juta/bln), SES A, SES B, SES C beserta rata-rata pengeluaran bulanan.
- **Persona Audiens Dominan:** Profil gaya hidup (misal: *Corporate Executives*, *Luxury Shoppers*, *University Students*, *Airport Travelers*).
- **Tipe Mobilitas:** Persentase Komuter Melintas vs Pengunjung Mall/Tempat Hiburan vs Warga Lokal Residensial.
- **Points of Interest (POIs):** Lokasi stasiun transit (MRT/LRT/KRL), mall, rumah sakit, dan perkantoran dalam radius 500m.

### 3. Cakupan Titik Billboard di Seluruh Indonesia
- **DKI Jakarta:** Bundaran HI Grand 3D DOOH, Sudirman SCBD Mega LED, Rasuna Said Kuningan, PIK Avenue Roundabout.
- **Surabaya:** Basuki Rahmat Simpang TP 3D Anamorphic, Ahmad Yani Frontage Waru Gateway.
- **Bandung:** Dago Simpang Cikapayang, Gerbang Tol Pasteur Gateway.
- **Bali:** Sunset Road Seminyak Triangle LED, Bypass Ngurah Rai Airport Intersection.
- **Medan:** Simpang Gatot Subroto & Merdeka Walk.
- **Semarang:** Simpang Lima Megatron.
- **Makassar:** Pantai Losari Sunset Boulevard LED.
- **Yogyakarta:** Tugu Jogja Heritage DOOH.

### 4. Alat Bantu Presentasi & Sales Klien
- **Peta Interaktif (Leaflet Geospatial Map):** Dark mode theme dengan pin interaktif, indikator denyut (*pulse*), dan filter kota instan.
- **Simulasi AI CCTV Vision:** Menampilkan simulasi deteksi computer vision (*bounding boxes*, FPS, *latency*, kecepatan kendaraan) untuk meyakinkan klien tentang akurasi data sensor.
- **Komparasi Titik Billboard (Side-by-Side):** Membandingkan 2 billboard secara berdampingan untuk membantu klien memilih media placement yang paling sesuai budget dan target audiens.
- **Dossier Proposal Media Plan Klien:** Template proposal formal yang siap dicetak atau disimpan sebagai PDF dengan 1 klik (`window.print()`).

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Plus Jakarta Sans Typography
- **Mapping:** Leaflet GIS Engine + CartoDB Dark Matter Tiles
- **Charts:** Recharts (24-Hour Area Charts, Peak Hour Gauges)
- **Icons:** Lucide React

---

## 📝 Menambahkan Titik Billboard Baru
Anda dapat menambahkan titik billboard baru dengan mengedit file:
`src/data/billboards.ts`
Cukup tambahkan koordinat GPS, nama jalan, dimensi layar, data volume trafik harian, dan profil demografinya.

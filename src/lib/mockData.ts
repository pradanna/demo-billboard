import { 
  Billboard, 
  TrafficRecord, 
  Demografi, 
  SummaryKPI, 
  TrafficLevel,
  TingkatPendapatan 
} from '../types';

// Deterministic Pseudo-Random Generator (Seed-based)
function createPRNG(initialSeed: number) {
  let s = initialSeed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Master Raw Data Seed for Indonesian Billboard Locations
interface CitySeed {
  kota: string;
  provinsi: string;
  centerLat: number;
  centerLng: number;
  spots: Array<{
    name: string;
    street: string;
    latOffset: number;
    lngOffset: number;
    tipe: string;
    ukuran: string;
    trafficBase: number; // Volume base per day
    level: TrafficLevel;
    income: TingkatPendapatan;
    pois: string[];
  }>;
}

const CITY_SEEDS: CitySeed[] = [
  {
    kota: "Jakarta",
    provinsi: "DKI Jakarta",
    centerLat: -6.2088,
    centerLng: 106.8456,
    spots: [
      { name: "Bundaran HI Grand Curved", street: "Jl. M.H. Thamrin No. 1", latOffset: 0.0138, lngOffset: -0.0226, tipe: "3D Curved DOOH", ukuran: "16m x 32m", trafficBase: 485000, level: "tinggi", income: "tinggi", pois: ["MRT Bundaran HI", "Grand Indonesia", "Plaza Indonesia"] },
      { name: "Sudirman SCBD Mega Pylon", street: "Jl. Jend. Sudirman Kav 52", latOffset: -0.0167, lngOffset: -0.0359, tipe: "DOOH / LED Digital", ukuran: "14m x 28m", trafficBase: 432000, level: "tinggi", income: "tinggi", pois: ["Pacific Place", "MRT Istora Mandiri", "Bursa Efek Indonesia"] },
      { name: "Rasuna Said Kuningan Simpang", street: "Jl. H.R. Rasuna Said Kav C-22", latOffset: -0.0150, lngOffset: -0.0158, tipe: "DOOH / LED Digital", ukuran: "12m x 24m", trafficBase: 395000, level: "tinggi", income: "tinggi", pois: ["LRT Rasuna Said", "Kuningan City", "Mall Ambasador"] },
      { name: "Gatot Subroto Flyover Pancoran", street: "Jl. Gatot Subroto No. 42", latOffset: -0.0345, lngOffset: -0.0035, tipe: "Megatron", ukuran: "12m x 24m", trafficBase: 460000, level: "tinggi", income: "menengah", pois: ["Stasiun Cawang", "Pancoran Riverside", "Wisma Aldiron"] },
      { name: "PIK Avenue Roundabout", street: "Jl. Pantai Indah Kapuk Boulevard", latOffset: 0.0983, lngOffset: -0.0966, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 285000, level: "sedang", income: "tinggi", pois: ["PIK Avenue Mall", "Pantjoran PIK", "Tzu Chi Center"] },
      { name: "Tomang Interchage Barat", street: "Jl. Tomang Raya No. 18", latOffset: 0.0321, lngOffset: -0.0512, tipe: "Static Vinyl", ukuran: "10m x 20m", trafficBase: 340000, level: "tinggi", income: "menengah", pois: ["Mall Taman Anggrek", "Central Park", "Akses Tol Jakarta-Tangerang"] },
      { name: "Kelapa Gading Boulevard Raya", street: "Jl. Boulevard Raya Blok M", latOffset: 0.0512, lngOffset: 0.0589, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 290000, level: "sedang", income: "tinggi", pois: ["Mall Kelapa Gading", "LRT Kelapa Gading", "La Piazza"] },
      { name: "Senayan Bundaran Senayan", street: "Jl. Jend. Sudirman No. 1", latOffset: -0.0189, lngOffset: -0.0450, tipe: "DOOH / LED Digital", ukuran: "12m x 24m", trafficBase: 410000, level: "tinggi", income: "tinggi", pois: ["Plaza Senayan", "Senayan City", "MRT Senayan"] }
    ]
  },
  {
    kota: "Surabaya",
    provinsi: "Jawa Timur",
    centerLat: -7.2575,
    centerLng: 112.7521,
    spots: [
      { name: "Basuki Rahmat Simpang TP", street: "Jl. Basuki Rahmat No. 8-12", latOffset: -0.0043, lngOffset: -0.0123, tipe: "3D Curved DOOH", ukuran: "14m x 26m", trafficBase: 382000, level: "tinggi", income: "tinggi", pois: ["Tunjungan Plaza 1-6", "Hotel Sheraton Surabaya", "Gubernur Suryo"] },
      { name: "Ahmad Yani Waru Gateway", street: "Jl. Ahmad Yani No. 152", latOffset: -0.0750, lngOffset: -0.0206, tipe: "Megatron", ukuran: "12m x 24m", trafficBase: 465000, level: "tinggi", income: "menengah", pois: ["City of Tomorrow (CITO)", "Bundaran Waru", "Stasiun Waru"] },
      { name: "Mayjen Sungkono Golden Gate", street: "Jl. Mayjen Sungkono No. 89", latOffset: -0.0345, lngOffset: -0.0543, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 310000, level: "sedang", income: "tinggi", pois: ["Ciputra World Surabaya", "Hotel Shangri-La", "Tol Satelit"] },
      { name: "Gubeng Pojok Stasiun", street: "Jl. Pemuda No. 45", latOffset: 0.0062, lngOffset: 0.0028, tipe: "Static Vinyl", ukuran: "8m x 16m", trafficBase: 240000, level: "sedang", income: "menengah", pois: ["Stasiun Gubeng", "Delta Plaza", "Grand City Mall"] },
      { name: "Darmo Alun-Alun Surabaya", street: "Jl. Raya Darmo No. 33", latOffset: -0.0278, lngOffset: -0.0145, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 295000, level: "sedang", income: "tinggi", pois: ["Taman Bungkul", "Kebun Binatang Surabaya", "RS Darmo"] },
      { name: "MERR Rungkut Madya", street: "Jl. Dr. Ir. H. Soekarno (MERR)", latOffset: -0.0612, lngOffset: 0.0321, tipe: "DOOH / LED Digital", ukuran: "8m x 16m", trafficBase: 220000, level: "sedang", income: "menengah", pois: ["Universitas Dinamika", "UPN Veteran Jatim", "Galaxy Mall"] }
    ]
  },
  {
    kota: "Bandung",
    provinsi: "Jawa Barat",
    centerLat: -6.9175,
    centerLng: 107.6191,
    spots: [
      { name: "Dago Simpang Cikapayang", street: "Jl. Ir. H. Juanda No. 84", latOffset: 0.0183, lngOffset: -0.0073, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 310000, level: "tinggi", income: "menengah", pois: ["Taman Cikapayang", "Institut Teknologi Bandung", "Living Plaza Dago"] },
      { name: "Pasteur Toll Gateway", street: "Jl. Dr. Djunjunan No. 138", latOffset: 0.0251, lngOffset: -0.0397, tipe: "Megatron", ukuran: "12m x 24m", trafficBase: 345000, level: "tinggi", income: "tinggi", pois: ["Gerbang Tol Pasteur", "BTC Fashion Mall", "Pool Shuttle DayTrans"] },
      { name: "Asia Afrika Alun-Alun", street: "Jl. Asia Afrika No. 65", latOffset: -0.0039, lngOffset: -0.0125, tipe: "DOOH / LED Digital", ukuran: "8m x 16m", trafficBase: 260000, level: "sedang", income: "menengah", pois: ["Gedung Merdeka", "Alun-Alun Bandung", "Hotel Savoy Homann"] },
      { name: "Riau LLRE Martadinata", street: "Jl. LLRE Martadinata No. 112", latOffset: 0.0092, lngOffset: 0.0084, tipe: "Static Vinyl", ukuran: "8m x 16m", trafficBase: 195000, level: "rendah", income: "tinggi", pois: ["Factory Outlet Riau", "Heritage Bandung", "Taman Pramuka"] },
      { name: "Buah Batu Simpang Tol", street: "Jl. Buah Batu No. 200", latOffset: -0.0489, lngOffset: 0.0142, tipe: "Static Vinyl", ukuran: "10m x 20m", trafficBase: 275000, level: "sedang", income: "menengah", pois: ["Pintu Tol Buah Batu", "Telkom University", "Pasar Kordon"] }
    ]
  },
  {
    kota: "Denpasar",
    provinsi: "Bali",
    centerLat: -8.6705,
    centerLng: 115.2126,
    spots: [
      { name: "Sunset Road Seminyak Triangle", street: "Jl. Sunset Road No. 88, Kuta", latOffset: -0.0207, lngOffset: -0.0362, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 265000, level: "tinggi", income: "tinggi", pois: ["Trans Studio Mall Bali", "Dewi Sri Culinary", "Akses Seminyak"] },
      { name: "Bypass Ngurah Rai Airport", street: "Jl. Bypass Ngurah Rai Simpang Tugu", latOffset: -0.0777, lngOffset: -0.0338, tipe: "3D Curved DOOH", ukuran: "12m x 24m", trafficBase: 298000, level: "tinggi", income: "tinggi", pois: ["Bandara I Gusti Ngurah Rai", "Tol Bali Mandara", "Krisna Tuban"] },
      { name: "Gatot Subroto Timur Renon", street: "Jl. Gatot Subroto Timur No. 102", latOffset: 0.0381, lngOffset: 0.0315, tipe: "Static Vinyl", ukuran: "8m x 16m", trafficBase: 185000, level: "rendah", income: "menengah", pois: ["Living World Denpasar", "Kawasan Pemerintahan Renon", "Sanur Beach Junction"] },
      { name: "Kuta Simpang Siur Underpass", street: "Jl. Bypass I Gusti Ngurah Rai No. 1", latOffset: -0.0520, lngOffset: -0.0320, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 280000, level: "tinggi", income: "tinggi", pois: ["Mall Bali Galeria", "Simpang Dewa Ruci", "Kuta Square"] }
    ]
  },
  {
    kota: "Medan",
    provinsi: "Sumatera Utara",
    centerLat: 3.5952,
    centerLng: 98.6722,
    spots: [
      { name: "Gatot Subroto Plaza Fair", street: "Jl. Gatot Subroto No. 32", latOffset: -0.0044, lngOffset: -0.0067, tipe: "DOOH / LED Digital", ukuran: "12m x 22m", trafficBase: 335000, level: "tinggi", income: "menengah", pois: ["Plaza Medan Fair", "RS Columbia Asia", "Stasiun KA Bandara"] },
      { name: "Merdeka Walk Lapangan Benteng", street: "Jl. Balai Kota No. 1", latOffset: 0.0012, lngOffset: 0.0055, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 290000, level: "tinggi", income: "tinggi", pois: ["Merdeka Walk", "Bank Indonesia Medan", "Kantor Pos Medan"] },
      { name: "Ring Road Gagak Hitam", street: "Jl. Ring Road / Gagak Hitam No. 77", latOffset: -0.0310, lngOffset: -0.0450, tipe: "Megatron", ukuran: "10m x 20m", trafficBase: 270000, level: "sedang", income: "menengah", pois: ["Ring Road City Walks", "Manhattan Mall", "Akses Tol Helvetia"] },
      { name: "Zainul Arifin Kampung Keling", street: "Jl. K.H. Zainul Arifin No. 55", latOffset: -0.0120, lngOffset: -0.0020, tipe: "Static Vinyl", ukuran: "8m x 16m", trafficBase: 210000, level: "sedang", income: "tinggi", pois: ["Sun Plaza Medan", "Kuil Shri Mariamman", "Vihara Gunung Timur"] }
    ]
  },
  {
    kota: "Semarang",
    provinsi: "Jawa Tengah",
    centerLat: -6.9932,
    centerLng: 110.4203,
    spots: [
      { name: "Simpang Lima Megatron", street: "Jl. Simpang Lima No. 1", latOffset: 0.0028, lngOffset: 0.0025, tipe: "Megatron", ukuran: "14m x 24m", trafficBase: 295000, level: "tinggi", income: "menengah", pois: ["Mall Ciputra Semarang", "Lapangan Pancasila", "Hotel Ciputra"] },
      { name: "Pandanaran Pusat Oleh-Oleh", street: "Jl. Pandanaran No. 58", latOffset: -0.0045, lngOffset: -0.0120, tipe: "DOOH / LED Digital", ukuran: "8m x 16m", trafficBase: 230000, level: "sedang", income: "menengah", pois: ["Sentra Bandeng Juwana", "RS Elisabeth", "Tugu Muda"] },
      { name: "Pemuda Tugu Muda Junction", street: "Jl. Pemuda No. 142", latOffset: 0.0150, lngOffset: -0.0080, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 280000, level: "tinggi", income: "menengah", pois: ["Lawang Sewu", "Museum Mandala Bhakti", "Mall Paragon"] }
    ]
  },
  {
    kota: "Makassar",
    provinsi: "Sulawesi Selatan",
    centerLat: -5.1477,
    centerLng: 119.4327,
    spots: [
      { name: "Pantai Losari Sunset Blvd", street: "Jl. Penghibur No. 10", latOffset: 0.0045, lngOffset: -0.0259, tipe: "DOOH / LED Digital", ukuran: "10m x 22m", trafficBase: 275000, level: "tinggi", income: "menengah", pois: ["Anjungan Pantai Losari", "Masjid Terapung", "Center Point of Indonesia"] },
      { name: "A.P. Pettarani Flyover", street: "Jl. A.P. Pettarani No. 88", latOffset: 0.0080, lngOffset: 0.0120, tipe: "Megatron", ukuran: "12m x 24m", trafficBase: 330000, level: "tinggi", income: "menengah", pois: ["Flyover Urip Sumoharjo", "Universitas Negeri Makassar", "Mall Panakkukang"] },
      { name: "Urip Sumoharjo Kantor Gubernur", street: "Jl. Urip Sumoharjo Km 5", latOffset: 0.0210, lngOffset: 0.0250, tipe: "Static Vinyl", ukuran: "10m x 20m", trafficBase: 250000, level: "sedang", income: "menengah", pois: ["Kantor Gubernur Sulsel", "RS Wahidin", "Universitas Hasanuddin"] }
    ]
  },
  {
    kota: "Yogyakarta",
    provinsi: "D.I. Yogyakarta",
    centerLat: -7.7956,
    centerLng: 110.3695,
    spots: [
      { name: "Tugu Jogja Heritage DOOH", street: "Jl. Jend. Sudirman No. 10", latOffset: 0.0128, lngOffset: -0.0025, tipe: "DOOH / LED Digital", ukuran: "10m x 20m", trafficBase: 288000, level: "tinggi", income: "menengah", pois: ["Tugu Pal Putih", "Stasiun Tugu", "Malioboro"] },
      { name: "Gejayan Affandi Colombo", street: "Jl. Affandi (Gejayan) No. 24", latOffset: 0.0320, lngOffset: 0.0210, tipe: "DOOH / LED Digital", ukuran: "8m x 16m", trafficBase: 240000, level: "sedang", income: "menengah", pois: ["Universitas Gadjah Mada (UGM)", "UNY", "Hartono Mall"] },
      { name: "Malioboro Nol Kilometer", street: "Jl. Pangurakan No. 1", latOffset: -0.0110, lngOffset: -0.0040, tipe: "Static Vinyl", ukuran: "6m x 12m", trafficBase: 310000, level: "tinggi", income: "menengah", pois: ["Titik 0 Km Jogja", "Benteng Vredeburg", "Keraton Yogyakarta"] }
    ]
  }
];

// Helper to generate the full list of Billboards
function generateBillboards(): Billboard[] {
  const billboards: Billboard[] = [];
  let idCounter = 1;

  CITY_SEEDS.forEach((city) => {
    city.spots.forEach((spot, idx) => {
      const id = `BB-${String(idCounter).padStart(3, '0')}`;
      idCounter++;

      billboards.push({
        id,
        nama: `${spot.name} (${city.kota})`,
        alamat: spot.street,
        kota: city.kota,
        provinsi: city.provinsi,
        lat: Number((city.centerLat + spot.latOffset).toFixed(6)),
        lng: Number((city.centerLng + spot.lngOffset).toFixed(6)),
        levelTraffic: spot.level,
        tipe: spot.tipe,
        ukuran: spot.ukuran,
        foto: `https://images.unsplash.com/photo-${1519501025264 + (idx * 1792)}?auto=format&fit=crop&w=800&q=80`,
        arahPandang: `Menghadap arus utama ${spot.street}`
      });
    });
  });

  return billboards;
}

// Cached Master Billboard List
const ALL_BILLBOARDS: Billboard[] = generateBillboards();

// Find spot metadata helper
function findSpotSeed(billboard: Billboard) {
  const city = CITY_SEEDS.find(c => c.kota === billboard.kota);
  if (!city) return null;
  return city.spots.find(s => billboard.nama.includes(s.name)) || city.spots[0];
}

/**
 * 1. getBillboards: Return list of all billboards with optional city & level filter
 */
export function getBillboards(filters?: { kota?: string; level?: TrafficLevel }): Billboard[] {
  let result = [...ALL_BILLBOARDS];
  if (filters?.kota && filters.kota !== "Semua") {
    result = result.filter(b => b.kota.toLowerCase() === filters.kota!.toLowerCase());
  }
  if (filters?.level) {
    result = result.filter(b => b.levelTraffic === filters.level);
  }
  return result;
}

/**
 * 2. getBillboardById: Return a single billboard
 */
export function getBillboardById(id: string): Billboard | undefined {
  return ALL_BILLBOARDS.find(b => b.id === id);
}

/**
 * 3. getTrafficByBillboard: Return traffic records for a billboard over a date range
 * daysCount: default 7 (mingguan), 1 (harian), 30 (bulanan)
 */
export function getTrafficByBillboard(id: string, daysCount: number = 7): TrafficRecord[] {
  const billboard = getBillboardById(id);
  const spotSeed = billboard ? findSpotSeed(billboard) : null;
  const baseTotal = spotSeed ? spotSeed.trafficBase : 300000;

  // Base seed derived from ID string
  const numId = parseInt(id.replace(/\D/g, ''), 10) || 1;
  const prng = createPRNG(numId * 100);

  const records: TrafficRecord[] = [];
  const today = new Date();

  // Mode ratios
  const isMotorcycleHeavy = spotSeed?.level === "tinggi";
  const motorRatio = isMotorcycleHeavy ? 0.52 : 0.46;
  const mobilRatio = 0.36;
  const pedestrianRatio = 0.08;
  const truckRatio = 0.04;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Day of week factor: weekends might have slightly different pedestrian vs truck share
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const fluctuation = 0.90 + prng() * 0.20; // 90% - 110%
    const dayTotal = Math.round(baseTotal * fluctuation);

    const motor = Math.round(dayTotal * motorRatio * (isWeekend ? 0.95 : 1.02));
    const mobil = Math.round(dayTotal * mobilRatio * (isWeekend ? 1.08 : 0.98));
    const pejalanKaki = Math.round(dayTotal * pedestrianRatio * (isWeekend ? 1.35 : 0.90));
    const truk = Math.max(0, dayTotal - motor - mobil - pejalanKaki);

    records.push({
      billboardId: id,
      tanggal: dateStr,
      motor,
      mobil,
      pejalanKaki,
      truk,
      total: motor + mobil + pejalanKaki + truk
    });
  }

  return records;
}

/**
 * 4. getDemografiByBillboard: Return demographic data for the area around a billboard
 */
export function getDemografiByBillboard(id: string): Demografi {
  const billboard = getBillboardById(id);
  const spotSeed = billboard ? findSpotSeed(billboard) : null;
  const numId = parseInt(id.replace(/\D/g, ''), 10) || 1;
  const prng = createPRNG(numId * 50);

  const estimasiPendapatan: TingkatPendapatan = spotSeed?.income || "menengah";
  const baseKepadatan = estimasiPendapatan === "tinggi" ? 14500 : 18200;

  return {
    billboardId: id,
    totalPenduduk: Math.round(85000 + prng() * 60000),
    kepadatanPerKm2: Math.round(baseKepadatan + (prng() - 0.5) * 4000),
    distribusiUsia: {
      "0-17": 14,
      "18-24": 24,
      "25-34": 38,
      "35-54": 18,
      "55+": 6
    },
    estimasiPendapatan,
    rasioGender: {
      pria: 51,
      wanita: 49
    },
    deskripsiWilayah: `Wilayah koridor komersial & perlintasan utama di ${billboard?.kota || "Indonesia"}. Dominasi audiens usia produktif dan kelas sosial ekonomi ${estimasiPendapatan}.`,
    poiTerdekat: spotSeed?.pois || ["Pusat Bisnis", "Pusat Perbelanjaan", "Stasiun Transit"]
  };
}

/**
 * 5. getSummaryKPI: Aggregate statistics across all or filtered billboards
 */
export function getSummaryKPI(billboardsList: Billboard[] = ALL_BILLBOARDS): SummaryKPI {
  const totalBillboard = billboardsList.length;
  let totalMotor = 0;
  let totalMobil = 0;
  let totalPejalanKaki = 0;
  let totalTruk = 0;

  billboardsList.forEach((b) => {
    const latest = getTrafficByBillboard(b.id, 1)[0];
    if (latest) {
      totalMotor += latest.motor;
      totalMobil += latest.mobil;
      totalPejalanKaki += latest.pejalanKaki;
      totalTruk += latest.truk;
    }
  });

  const totalTrafficHarian = totalMotor + totalMobil + totalPejalanKaki + totalTruk;
  const rataRataTrafficPerBillboard = totalBillboard > 0 ? Math.round(totalTrafficHarian / totalBillboard) : 0;

  return {
    totalBillboard,
    totalTrafficHarian,
    rataRataTrafficPerBillboard,
    totalMotor,
    totalMobil,
    totalPejalanKaki,
    totalTruk
  };
}

/**
 * 6. getAllCities: Return unique list of cities
 */
export function getAllCities(): string[] {
  return Array.from(new Set(ALL_BILLBOARDS.map(b => b.kota)));
}

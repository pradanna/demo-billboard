export type TingkatPendapatan = "rendah" | "menengah" | "tinggi";

export interface DistribusiUsia {
  "0-17": number;
  "18-24": number;
  "25-34": number;
  "35-54": number;
  "55+": number;
}

export interface Demografi {
  billboardId: string;
  totalPenduduk: number;
  kepadatanPerKm2: number;
  distribusiUsia: DistribusiUsia; // persen, total ~100%
  estimasiPendapatan: TingkatPendapatan;
  rasioGender?: {
    pria: number;
    wanita: number;
  };
  deskripsiWilayah?: string;
  poiTerdekat?: string[];
}

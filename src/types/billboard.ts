export type TrafficLevel = "rendah" | "sedang" | "tinggi";

export interface Billboard {
  id: string;
  nama: string;
  alamat: string;
  kota: string;
  provinsi: string;
  lat: number;
  lng: number;
  levelTraffic: TrafficLevel; // untuk warna marker (merah/kuning/hijau)
  tipe?: string; // e.g. "DOOH / LED Digital", "Megatron", "Static Vinyl", "3D Curved"
  ukuran?: string; // e.g. "12m x 24m"
  foto?: string; // URL foto placeholder
  arahPandang?: string;
}

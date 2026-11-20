export interface TrafficRecord {
  billboardId: string;
  tanggal: string; // ISO date format: YYYY-MM-DD
  motor: number;
  mobil: number;
  pejalanKaki: number;
  truk: number;
  total?: number;
  jam?: string; // Optional: for hourly breakdown if needed
}

export type TimeFilter = "harian" | "mingguan" | "bulanan" | "custom";

export interface DateRangeFilter {
  type: TimeFilter;
  startDate?: string;
  endDate?: string;
}

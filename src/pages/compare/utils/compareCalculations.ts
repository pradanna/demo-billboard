import { Billboard, TrafficRecord, Demografi, TimeFilter } from '../../../types';
import { getBillboardById, getTrafficByBillboard, getDemografiByBillboard, getBillboards } from '../../../lib/mockData';

export interface BillboardCompareData {
  billboard: Billboard;
  demografi: Demografi;
  trafficRecords: TrafficRecord[];
  totalTraffic: number;
  avgDailyTraffic: number;
  totalMotor: number;
  totalMobil: number;
  totalPejalanKaki: number;
  totalTruk: number;
  percentMotor: number;
  percentMobil: number;
  percentPejalanKaki: number;
  percentTruk: number;
}

export interface CityCompareData {
  kota: string;
  provinsi: string;
  totalBillboards: number;
  billboards: Billboard[];
  totalTraffic: number;
  avgDailyPerBillboard: number;
  totalMotor: number;
  totalMobil: number;
  totalPejalanKaki: number;
  totalTruk: number;
  percentMotor: number;
  percentMobil: number;
  percentPejalanKaki: number;
  percentTruk: number;
  avgKepadatan: number;
  dominantLevel: string;
  dailyTrend: Array<{
    tanggal: string;
    total: number;
    motor: number;
    mobil: number;
    pejalanKaki: number;
    truk: number;
  }>;
}

export function getDaysCountFromFilter(filter: TimeFilter): number {
  switch (filter) {
    case 'harian':
      return 1;
    case 'mingguan':
      return 7;
    case 'bulanan':
      return 30;
    case 'custom':
      return 14;
    default:
      return 7;
  }
}

export function getBillboardCompareData(id: string, daysCount: number): BillboardCompareData | null {
  const billboard = getBillboardById(id);
  if (!billboard) return null;

  const demografi = getDemografiByBillboard(id);
  const trafficRecords = getTrafficByBillboard(id, daysCount);

  let totalMotor = 0;
  let totalMobil = 0;
  let totalPejalanKaki = 0;
  let totalTruk = 0;

  trafficRecords.forEach((rec) => {
    totalMotor += rec.motor;
    totalMobil += rec.mobil;
    totalPejalanKaki += rec.pejalanKaki;
    totalTruk += rec.truk;
  });

  const totalTraffic = totalMotor + totalMobil + totalPejalanKaki + totalTruk;
  const avgDailyTraffic = daysCount > 0 ? Math.round(totalTraffic / daysCount) : 0;

  const percentMotor = totalTraffic > 0 ? Math.round((totalMotor / totalTraffic) * 100) : 0;
  const percentMobil = totalTraffic > 0 ? Math.round((totalMobil / totalTraffic) * 100) : 0;
  const percentPejalanKaki = totalTraffic > 0 ? Math.round((totalPejalanKaki / totalTraffic) * 100) : 0;
  const percentTruk = totalTraffic > 0 ? Math.round((totalTruk / totalTraffic) * 100) : 0;

  return {
    billboard,
    demografi,
    trafficRecords,
    totalTraffic,
    avgDailyTraffic,
    totalMotor,
    totalMobil,
    totalPejalanKaki,
    totalTruk,
    percentMotor,
    percentMobil,
    percentPejalanKaki,
    percentTruk,
  };
}

export function getCityCompareData(kota: string, daysCount: number): CityCompareData | null {
  const billboards = getBillboards({ kota });
  if (billboards.length === 0) return null;

  const provinsi = billboards[0].provinsi;
  let totalMotor = 0;
  let totalMobil = 0;
  let totalPejalanKaki = 0;
  let totalTruk = 0;
  let totalKepadatan = 0;

  const dateMap: { [date: string]: { motor: number; mobil: number; pejalanKaki: number; truk: number; total: number } } = {};

  billboards.forEach((b) => {
    const dem = getDemografiByBillboard(b.id);
    totalKepadatan += dem.kepadatanPerKm2;

    const records = getTrafficByBillboard(b.id, daysCount);
    records.forEach((rec) => {
      totalMotor += rec.motor;
      totalMobil += rec.mobil;
      totalPejalanKaki += rec.pejalanKaki;
      totalTruk += rec.truk;

      if (!dateMap[rec.tanggal]) {
        dateMap[rec.tanggal] = { motor: 0, mobil: 0, pejalanKaki: 0, truk: 0, total: 0 };
      }
      dateMap[rec.tanggal].motor += rec.motor;
      dateMap[rec.tanggal].mobil += rec.mobil;
      dateMap[rec.tanggal].pejalanKaki += rec.pejalanKaki;
      dateMap[rec.tanggal].truk += rec.truk;
      dateMap[rec.tanggal].total += (rec.motor + rec.mobil + rec.pejalanKaki + rec.truk);
    });
  });

  const totalTraffic = totalMotor + totalMobil + totalPejalanKaki + totalTruk;
  const avgDailyPerBillboard = (billboards.length * daysCount) > 0 
    ? Math.round(totalTraffic / (billboards.length * daysCount)) 
    : 0;
  const avgKepadatan = Math.round(totalKepadatan / billboards.length);

  const percentMotor = totalTraffic > 0 ? Math.round((totalMotor / totalTraffic) * 100) : 0;
  const percentMobil = totalTraffic > 0 ? Math.round((totalMobil / totalTraffic) * 100) : 0;
  const percentPejalanKaki = totalTraffic > 0 ? Math.round((totalPejalanKaki / totalTraffic) * 100) : 0;
  const percentTruk = totalTraffic > 0 ? Math.round((totalTruk / totalTraffic) * 100) : 0;

  const levelsCount = billboards.reduce((acc, b) => {
    acc[b.levelTraffic] = (acc[b.levelTraffic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantLevel = Object.entries(levelsCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'sedang';

  const dailyTrend = Object.entries(dateMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([tanggal, data]) => ({
      tanggal,
      ...data,
    }));

  return {
    kota,
    provinsi,
    totalBillboards: billboards.length,
    billboards,
    totalTraffic,
    avgDailyPerBillboard,
    totalMotor,
    totalMobil,
    totalPejalanKaki,
    totalTruk,
    percentMotor,
    percentMobil,
    percentPejalanKaki,
    percentTruk,
    avgKepadatan,
    dominantLevel,
    dailyTrend,
  };
}

export const COMPARE_COLORS = [
  {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    hex: '#2563eb',
    badge: 'bg-blue-600 text-white',
    ring: 'ring-blue-500',
  },
  {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    hex: '#059669',
    badge: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-500',
  },
  {
    border: 'border-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    hex: '#d97706',
    badge: 'bg-amber-600 text-white',
    ring: 'ring-amber-500',
  },
  {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    hex: '#9333ea',
    badge: 'bg-purple-600 text-white',
    ring: 'ring-purple-500',
  },
];

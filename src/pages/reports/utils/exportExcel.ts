import * as XLSX from 'xlsx';
import { 
  getBillboards, 
  getBillboardById, 
  getTrafficByBillboard, 
  getDemografiByBillboard 
} from '../../../lib/mockData';
import { Billboard } from '../../../types';
import { ReportConfig } from '../types';

export interface ExportExcelResult {
  fileName: string;
  fileSize: string;
  billboardCount: number;
}

export async function generateExcelReport(config: ReportConfig): Promise<ExportExcelResult> {
  // 1. Resolve Billboards in Scope
  let billboards: Billboard[] = [];
  let scopeLabel = 'Semua Titik (Nasional)';

  if (config.scopeType === 'city' && config.city) {
    billboards = getBillboards({ kota: config.city });
    scopeLabel = `Wilayah Kota ${config.city} (${billboards.length} Titik)`;
  } else if (config.scopeType === 'single' && config.billboardId) {
    const single = getBillboardById(config.billboardId);
    if (single) {
      billboards = [single];
      scopeLabel = `${single.id} - ${single.nama} (${single.kota})`;
    } else {
      billboards = getBillboards().slice(0, 1);
      scopeLabel = `${billboards[0].id} - ${billboards[0].nama}`;
    }
  } else {
    billboards = getBillboards();
    scopeLabel = `Semua Wilayah Nasional (${billboards.length} Titik)`;
  }

  const daysCount = config.timeRange === 'harian' ? 1 : config.timeRange === 'mingguan' ? 7 : 30;
  const timeRangeLabel = config.timeRange === 'harian' ? 'Harian (1 Hari Terakhir)' : 
                         config.timeRange === 'mingguan' ? 'Mingguan (7 Hari Terakhir)' : 'Bulanan (30 Hari Terakhir)';

  const wb = XLSX.utils.book_new();

  // 2. Aggregate Data
  let grandTotalMotor = 0;
  let grandTotalMobil = 0;
  let grandTotalPedestrian = 0;
  let grandTotalTruck = 0;

  const billboardData = billboards.map(b => {
    const records = getTrafficByBillboard(b.id, daysCount);
    const avgMotor = Math.round(records.reduce((acc, r) => acc + r.motor, 0) / records.length);
    const avgMobil = Math.round(records.reduce((acc, r) => acc + r.mobil, 0) / records.length);
    const avgPedestrian = Math.round(records.reduce((acc, r) => acc + r.pejalanKaki, 0) / records.length);
    const avgTruck = Math.round(records.reduce((acc, r) => acc + r.truk, 0) / records.length);
    const avgTotal = avgMotor + avgMobil + avgPedestrian + avgTruck;

    grandTotalMotor += avgMotor;
    grandTotalMobil += avgMobil;
    grandTotalPedestrian += avgPedestrian;
    grandTotalTruck += avgTruck;

    const demografi = getDemografiByBillboard(b.id);

    return {
      billboard: b,
      records,
      avgMotor,
      avgMobil,
      avgPedestrian,
      avgTruck,
      avgTotal,
      demografi
    };
  });

  const grandTotalDaily = grandTotalMotor + grandTotalMobil + grandTotalPedestrian + grandTotalTruck;
  const avgPerSpot = billboards.length > 0 ? Math.round(grandTotalDaily / billboards.length) : 0;
  const motorPct = grandTotalDaily > 0 ? ((grandTotalMotor / grandTotalDaily) * 100).toFixed(1) : '0';
  const mobilPct = grandTotalDaily > 0 ? ((grandTotalMobil / grandTotalDaily) * 100).toFixed(1) : '0';
  const pedestrianPct = grandTotalDaily > 0 ? ((grandTotalPedestrian / grandTotalDaily) * 100).toFixed(1) : '0';
  const truckPct = grandTotalDaily > 0 ? ((grandTotalTruck / grandTotalDaily) * 100).toFixed(1) : '0';

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // ==========================================
  // SHEET 1: Ringkasan Eksekutif & KPI
  // ==========================================
  const summaryAoa: any[][] = [
    ['NEXTRAFFIC INTELLIGENCE — LAPORAN EKSEKUTIF TRAFIK OOH'],
    ['Platform Analisis Data Lalu Lintas & Demografi Titik Billboard Indonesia'],
    [],
    ['PARAMETER LAPORAN', ''],
    ['Judul Laporan', config.title],
    ['Target Klien / Agensi', config.clientName || 'Mitra Pengiklan'],
    ['Cakupan Wilayah', scopeLabel],
    ['Rentang Periode', timeRangeLabel],
    ['Tanggal Dibuat', todayStr],
    ['Sistem Generator', 'NexTraffic Analytics Engine v1.0 (Client-side Export)'],
    [],
    ['RINGKASAN KPI AGREGAT', 'NILAI', 'SATUAN', 'KETERANGAN'],
    ['Total Titik Billboard', billboards.length, 'Titik Spot', 'Jumlah lokasi billboard yang dianalisis'],
    ['Estimasi Trafik Harian Agregat', grandTotalDaily, 'Kendaraan / Hari', 'Total impresi potensial harian seluruh titik'],
    ['Rata-Rata Trafik per Titik', avgPerSpot, 'Kendaraan / Titik / Hari', 'Rerata lalu lintas per spot'],
    ['Total Sepeda Motor', grandTotalMotor, 'Kendaraan / Hari', `Pangsa moda ${motorPct}%`],
    ['Total Mobil Penumpang', grandTotalMobil, 'Kendaraan / Hari', `Pangsa moda ${mobilPct}%`],
    ['Total Pejalan Kaki (Footfall)', grandTotalPedestrian, 'Orang / Hari', `Pangsa moda ${pedestrianPct}%`],
    ['Total Truk & Kendaraan Berat', grandTotalTruck, 'Kendaraan / Hari', `Pangsa moda ${truckPct}%`],
  ];

  if (config.notes) {
    summaryAoa.push([]);
    summaryAoa.push(['CATATAN TAMBAHAN DARI ANALIS']);
    summaryAoa.push([config.notes]);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  wsSummary['!cols'] = [
    { wch: 34 },
    { wch: 30 },
    { wch: 25 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan_KPI');

  // ==========================================
  // SHEET 2: Daftar Titik Billboard
  // ==========================================
  const billboardRows = billboardData.map((item, idx) => ({
    'No': idx + 1,
    'ID Billboard': item.billboard.id,
    'Nama Billboard': item.billboard.nama,
    'Alamat Lengkap': item.billboard.alamat,
    'Kota': item.billboard.kota,
    'Provinsi': item.billboard.provinsi,
    'Latitude': item.billboard.lat,
    'Longitude': item.billboard.lng,
    'Tipe Media': item.billboard.tipe || 'DOOH / LED Digital',
    'Ukuran Fisik': item.billboard.ukuran || 'Standar',
    'Level Trafik': item.billboard.levelTraffic.toUpperCase(),
    'Est. Trafik Rata-rata/Hari': item.avgTotal
  }));

  const wsBillboard = XLSX.utils.json_to_sheet(billboardRows);
  wsBillboard['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 35 },
    { wch: 40 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsBillboard, 'Daftar_Billboard');

  // ==========================================
  // SHEET 3: Historis Traffic Harian
  // ==========================================
  const trafficDailyRows: any[] = [];
  billboardData.forEach(item => {
    item.records.forEach(rec => {
      trafficDailyRows.push({
        'ID Billboard': item.billboard.id,
        'Nama Billboard': item.billboard.nama,
        'Kota': item.billboard.kota,
        'Tanggal (ISO)': rec.tanggal,
        'Sepeda Motor': rec.motor,
        'Mobil Penumpang': rec.mobil,
        'Pejalan Kaki': rec.pejalanKaki,
        'Truk & Bus': rec.truk,
        'Total Trafik Harian': rec.total || (rec.motor + rec.mobil + rec.pejalanKaki + rec.truk)
      });
    });
  });

  const wsTraffic = XLSX.utils.json_to_sheet(trafficDailyRows);
  wsTraffic['!cols'] = [
    { wch: 14 },
    { wch: 32 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTraffic, 'Data_Traffic_Harian');

  // ==========================================
  // SHEET 4: Demografi & Audiens (jika diikutsertakan)
  // ==========================================
  if (config.includeDemographics) {
    const demoRows = billboardData.map(item => ({
      'ID Billboard': item.billboard.id,
      'Nama Billboard': item.billboard.nama,
      'Kota': item.billboard.kota,
      'Total Penduduk (1km)': item.demografi.totalPenduduk,
      'Kepadatan (/km2)': item.demografi.kepadatanPerKm2,
      'Kelas Pendapatan (SES)': item.demografi.estimasiPendapatan.toUpperCase(),
      'Gender Pria (%)': item.demografi.rasioGender?.pria || 50,
      'Gender Wanita (%)': item.demografi.rasioGender?.wanita || 50,
      'Usia 0-17 (%)': item.demografi.distribusiUsia['0-17'],
      'Usia 18-24 (%)': item.demografi.distribusiUsia['18-24'],
      'Usia 25-34 (%)': item.demografi.distribusiUsia['25-34'],
      'Usia 35-54 (%)': item.demografi.distribusiUsia['35-54'],
      'Usia 55+ (%)': item.demografi.distribusiUsia['55+'],
      'POI Terdekat': item.demografi.poiTerdekat?.join('; ') || '-',
      'Deskripsi Wilayah': item.demografi.deskripsiWilayah || '-'
    }));

    const wsDemo = XLSX.utils.json_to_sheet(demoRows);
    wsDemo['!cols'] = [
      { wch: 14 },
      { wch: 32 },
      { wch: 16 },
      { wch: 22 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 35 },
      { wch: 45 }
    ];
    XLSX.utils.book_append_sheet(wb, wsDemo, 'Data_Demografi');
  }

  // Generate File Name & Trigger Download
  const cleanScope = config.scopeType === 'city' ? (config.city || 'Kota') : 
                     config.scopeType === 'single' ? (config.billboardId || 'Spot') : 'Nasional';
  const cleanDate = new Date().toISOString().split('T')[0];
  const fileName = `NexTraffic_Dataset_${cleanScope}_${cleanDate}.xlsx`;

  // Trigger client-side download
  XLSX.writeFile(wb, fileName);

  // Approximate size estimate
  const approxBytes = JSON.stringify(summaryAoa).length + (billboardRows.length * 120) + (trafficDailyRows.length * 90);
  const sizeKb = Math.max(18, Math.round(approxBytes / 40));
  const fileSize = `${sizeKb} KB`;

  return {
    fileName,
    fileSize,
    billboardCount: billboards.length
  };
}

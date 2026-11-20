import { GeneratedReportItem, ReportConfig } from '../types';

const STORAGE_KEY = 'billboard_reports_history_v1';

export const INITIAL_REPORT_HISTORY: GeneratedReportItem[] = [
  {
    id: 'RPT-2026-081',
    title: 'Executive Dossier — Kampanye Brand Awareness Jakarta & Bodetabek',
    clientName: 'PT Telkomsel Indonesia Tbk',
    format: 'PDF',
    scopeLabel: 'Wilayah Kota Jakarta (8 Titik)',
    timeRangeLabel: 'Mingguan (7 Hari Terakhir)',
    generatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    fileSize: '412 KB',
    billboardCount: 8,
    config: {
      title: 'Executive Dossier — Kampanye Brand Awareness Jakarta & Bodetabek',
      clientName: 'PT Telkomsel Indonesia Tbk',
      scopeType: 'city',
      city: 'Jakarta',
      timeRange: 'mingguan',
      format: 'PDF',
      includeDemographics: true,
      includeVehicleBreakdown: true,
      includePoi: true,
      notes: 'Prioritas pada koridor Sudirman-Thamrin dan Rasuna Said untuk penempatan slot prime time LED digital.'
    }
  },
  {
    id: 'RPT-2026-079',
    title: 'Raw Data Tabular Traffic Seluruh Indonesia (Nasional)',
    clientName: 'Mindshare Indonesia (Media Agency)',
    format: 'EXCEL',
    scopeLabel: 'Semua Wilayah Nasional (23 Titik)',
    timeRangeLabel: 'Bulanan (30 Hari Terakhir)',
    generatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    fileSize: '184 KB',
    billboardCount: 23,
    config: {
      title: 'Raw Data Tabular Traffic Seluruh Indonesia (Nasional)',
      clientName: 'Mindshare Indonesia (Media Agency)',
      scopeType: 'all',
      timeRange: 'bulanan',
      format: 'EXCEL',
      includeDemographics: true,
      includeVehicleBreakdown: true,
      includePoi: true,
      notes: 'Ekstraksi dataset lengkap untuk media planning audit semester 1.'
    }
  },
  {
    id: 'RPT-2026-074',
    title: 'Spotlight Analisis Titik Bundaran HI Grand Curved 3D',
    clientName: 'PT Astra International Tbk',
    format: 'BOTH',
    scopeLabel: 'BB-001 - Bundaran HI Grand Curved (Jakarta)',
    timeRangeLabel: 'Mingguan (7 Hari Terakhir)',
    generatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    fileSize: '528 KB',
    billboardCount: 1,
    config: {
      title: 'Spotlight Analisis Titik Bundaran HI Grand Curved 3D',
      clientName: 'PT Astra International Tbk',
      scopeType: 'single',
      billboardId: 'BB-001',
      timeRange: 'mingguan',
      format: 'BOTH',
      includeDemographics: true,
      includeVehicleBreakdown: true,
      includePoi: true,
      notes: 'Evaluasi visibilitas dan footfall di sekitar ikon bundaran HI menjelang peluncuran produk baru.'
    }
  }
];

export function getReportHistory(): GeneratedReportItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Save initial seed to storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORT_HISTORY));
      return INITIAL_REPORT_HISTORY;
    }
    return JSON.parse(raw) as GeneratedReportItem[];
  } catch (e) {
    console.error('Failed to load report history from localStorage', e);
    return INITIAL_REPORT_HISTORY;
  }
}

export function saveReportHistory(items: GeneratedReportItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save report history to localStorage', e);
  }
}

export function addReportToHistory(report: GeneratedReportItem): GeneratedReportItem[] {
  const current = getReportHistory();
  const updated = [report, ...current];
  saveReportHistory(updated);
  return updated;
}

export function removeReportFromHistory(id: string): GeneratedReportItem[] {
  const current = getReportHistory();
  const updated = current.filter(item => item.id !== id);
  saveReportHistory(updated);
  return updated;
}

export function clearReportHistory(): GeneratedReportItem[] {
  saveReportHistory([]);
  return [];
}

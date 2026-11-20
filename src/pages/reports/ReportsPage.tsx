import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { 
  FileText, 
  Download, 
  Printer, 
  Info, 
  Clock, 
  CheckCircle2, 
  FileSpreadsheet, 
  Layers, 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';
import { generatePdfReport } from './utils/exportPdf';
import { generateExcelReport } from './utils/exportExcel';
import { 
  getReportHistory, 
  addReportToHistory, 
  removeReportFromHistory, 
  clearReportHistory 
} from './utils/historyStorage';
import { GeneratedReportItem, ReportConfig } from './types';
import { ReportConfigModal } from './components/ReportConfigModal';
import { ReportPreviewModal } from './components/ReportPreviewModal';
import { ReportHistoryTable } from './components/ReportHistoryTable';
import { getAllCities, getBillboards, getBillboardById } from '../../lib/mockData';

interface LayoutContext {
  selectedCity: string;
}

export const ReportsPage: React.FC = () => {
  const { selectedCity } = useOutletContext<LayoutContext>();
  const [reports, setReports] = useState<GeneratedReportItem[]>([]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<GeneratedReportItem | null>(null);
  
  // Quick spotlight billboard selector
  const allBillboards = getBillboards();
  const [spotlightBillboardId, setSpotlightBillboardId] = useState<string>(allBillboards[0]?.id || 'BB-001');

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    setReports(getReportHistory());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Generate handler for custom configuration
  const handleGenerateCustom = async (config: ReportConfig) => {
    const reportId = `RPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    let generatedSize = '350 KB';
    let billboardCount = 1;

    // Scope label calculation
    let scopeLabel = 'Semua Wilayah Nasional';
    if (config.scopeType === 'city' && config.city) {
      scopeLabel = `Kota ${config.city}`;
    } else if (config.scopeType === 'single' && config.billboardId) {
      const b = getBillboardById(config.billboardId);
      scopeLabel = b ? `${b.id} - ${b.nama}` : config.billboardId;
    }

    const timeRangeLabel = config.timeRange === 'harian' ? 'Harian (1 Hari)' :
                           config.timeRange === 'mingguan' ? 'Mingguan (7 Hari)' : 'Bulanan (30 Hari)';

    if (config.format === 'PDF' || config.format === 'BOTH') {
      const res = await generatePdfReport(config);
      generatedSize = res.fileSize;
      billboardCount = res.billboardCount;
    }

    if (config.format === 'EXCEL' || config.format === 'BOTH') {
      const res = await generateExcelReport(config);
      if (config.format === 'EXCEL') {
        generatedSize = res.fileSize;
        billboardCount = res.billboardCount;
      } else {
        generatedSize = '540 KB';
      }
    }

    const newReport: GeneratedReportItem = {
      id: reportId,
      title: config.title,
      clientName: config.clientName,
      format: config.format,
      scopeLabel,
      timeRangeLabel,
      generatedAt: new Date().toISOString(),
      fileSize: generatedSize,
      billboardCount,
      config
    };

    const updated = addReportToHistory(newReport);
    setReports(updated);
    showToast(`Laporan ${reportId} berhasil di-generate & diunduh!`);
  };

  // Quick Export PDF handler
  const handleQuickExportPdf = async () => {
    const isCityFiltered = selectedCity && selectedCity !== 'Semua';
    const config: ReportConfig = {
      title: isCityFiltered 
        ? `Ringkasan Eksekutif OOH Traffic — Wilayah ${selectedCity}`
        : 'Ringkasan Eksekutif OOH Traffic Seluruh Indonesia',
      clientName: 'Mitra Pengiklan Luar Ruang',
      scopeType: isCityFiltered ? 'city' : 'all',
      city: isCityFiltered ? selectedCity : undefined,
      timeRange: 'mingguan',
      format: 'PDF',
      includeVehicleBreakdown: true,
      includeDemographics: true,
      includePoi: true,
      notes: 'Laporan visual cepat digenerate otomatis dari dashboard NexTraffic.'
    };

    const res = await generatePdfReport(config);
    const reportId = `RPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newReport: GeneratedReportItem = {
      id: reportId,
      title: config.title,
      clientName: config.clientName,
      format: 'PDF',
      scopeLabel: isCityFiltered ? `Kota ${selectedCity}` : 'Semua Wilayah Nasional',
      timeRangeLabel: 'Mingguan (7 Hari)',
      generatedAt: new Date().toISOString(),
      fileSize: res.fileSize,
      billboardCount: res.billboardCount,
      config
    };

    const updated = addReportToHistory(newReport);
    setReports(updated);
    showToast(`Berkas PDF ${res.fileName} (${res.fileSize}) berhasil diunduh!`);
  };

  // Quick Export Excel handler
  const handleQuickExportExcel = async () => {
    const isCityFiltered = selectedCity && selectedCity !== 'Semua';
    const config: ReportConfig = {
      title: isCityFiltered 
        ? `Raw Dataset OOH Traffic — Wilayah ${selectedCity}`
        : 'Raw Dataset OOH Traffic Seluruh Indonesia',
      clientName: 'Media Planner & Analytics Team',
      scopeType: isCityFiltered ? 'city' : 'all',
      city: isCityFiltered ? selectedCity : undefined,
      timeRange: 'mingguan',
      format: 'EXCEL',
      includeVehicleBreakdown: true,
      includeDemographics: true,
      includePoi: true,
      notes: 'Dataset mentah lengkap untuk analisis spreadsheet.'
    };

    const res = await generateExcelReport(config);
    const reportId = `RPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newReport: GeneratedReportItem = {
      id: reportId,
      title: config.title,
      clientName: config.clientName,
      format: 'EXCEL',
      scopeLabel: isCityFiltered ? `Kota ${selectedCity}` : 'Semua Wilayah Nasional',
      timeRangeLabel: 'Mingguan (7 Hari)',
      generatedAt: new Date().toISOString(),
      fileSize: res.fileSize,
      billboardCount: res.billboardCount,
      config
    };

    const updated = addReportToHistory(newReport);
    setReports(updated);
    showToast(`Berkas Excel ${res.fileName} (${res.fileSize}) berhasil diunduh!`);
  };

  // Quick Spotlight Billboard Export
  const handleSpotlightExport = async (format: 'PDF' | 'EXCEL') => {
    const b = getBillboardById(spotlightBillboardId) || allBillboards[0];
    const config: ReportConfig = {
      title: `Analisis Spotlight Titik Billboard — ${b.nama}`,
      clientName: 'Target Advertiser',
      scopeType: 'single',
      billboardId: b.id,
      timeRange: 'mingguan',
      format,
      includeVehicleBreakdown: true,
      includeDemographics: true,
      includePoi: true,
      notes: `Evaluasi spesifik titik ${b.nama} di ${b.alamat}, ${b.kota}.`
    };

    let resSize = '280 KB';
    let fName = '';
    if (format === 'PDF') {
      const res = await generatePdfReport(config);
      resSize = res.fileSize;
      fName = res.fileName;
    } else {
      const res = await generateExcelReport(config);
      resSize = res.fileSize;
      fName = res.fileName;
    }

    const reportId = `RPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newReport: GeneratedReportItem = {
      id: reportId,
      title: config.title,
      clientName: config.clientName,
      format,
      scopeLabel: `${b.id} - ${b.nama}`,
      timeRangeLabel: 'Mingguan (7 Hari)',
      generatedAt: new Date().toISOString(),
      fileSize: resSize,
      billboardCount: 1,
      config
    };

    const updated = addReportToHistory(newReport);
    setReports(updated);
    showToast(`Spotlight ${b.id} format ${format} berhasil diunduh! (${fName})`);
  };

  // Re-download from history
  const handleDownloadPdfFromHistory = async (report: GeneratedReportItem) => {
    const res = await generatePdfReport(report.config);
    showToast(`Unduh ulang ${res.fileName} berhasil!`);
  };

  const handleDownloadExcelFromHistory = async (report: GeneratedReportItem) => {
    const res = await generateExcelReport(report.config);
    showToast(`Unduh ulang ${res.fileName} berhasil!`);
  };

  // Delete from history
  const handleDeleteReport = (id: string) => {
    const updated = removeReportFromHistory(id);
    setReports(updated);
    showToast('Laporan dihapus dari riwayat.');
  };

  const handleClearAll = () => {
    const updated = clearReportHistory();
    setReports(updated);
    showToast('Seluruh riwayat laporan telah dibersihkan.');
  };

  // Calculate statistics
  const totalReportsCount = reports.length;
  const pdfCount = reports.filter(r => r.format === 'PDF' || r.format === 'BOTH').length;
  const excelCount = reports.filter(r => r.format === 'EXCEL' || r.format === 'BOTH').length;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pusat Laporan & Export Data
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate ringkasan visual format PDF untuk klien dan dataset mentah format Excel (Client-side Generator)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hidden sm:block">
            Agent 4: Reports & Export
          </div>
          
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            Buat Laporan Kustom
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Total Riwayat Laporan</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900">{totalReportsCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tersimpan di local storage</div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Berkas PDF Dibuat</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900">{pdfCount} Berkas</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Proposal visual klien</div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Berkas Excel Dibuat</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900">{excelCount} Berkas</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Multi-sheet raw tabular</div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Filter Aktif Saat Ini</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <MapPin className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 truncate">
            {selectedCity === 'Semua' ? 'Nasional' : selectedCity}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {selectedCity === 'Semua' ? '23 Titik se-Indonesia' : `Titik di ${selectedCity}`}
          </div>
        </Card>
      </div>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PDF Quick Export */}
        <Card className="flex flex-col justify-between p-5 border-blue-100 hover:border-blue-300 transition-all bg-gradient-to-br from-white via-white to-blue-50/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Printer className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Export Ringkasan PDF (Visual Dossier)
                  </h3>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Format Proposal Klien OOH
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Menghasilkan dokumen presentasi visual lengkap mencakup ringkasan eksekutif KPI impresi, 
              tabel karakteristik titik, estimasi pangsa moda transportasi, profil demografi SES, dan rekomendasi analitis.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Cakupan export: <strong className="text-slate-800">{selectedCity === 'Semua' ? 'Semua Wilayah Nasional (23 Titik)' : `Kota ${selectedCity}`}</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">Client-side jsPDF Engine</span>
            <button
              onClick={handleQuickExportPdf}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Dossier PDF
            </button>
          </div>
        </Card>

        {/* Excel Quick Export */}
        <Card className="flex flex-col justify-between p-5 border-emerald-100 hover:border-emerald-300 transition-all bg-gradient-to-br from-white via-white to-emerald-50/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Export Raw Data Excel (XLSX)
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    4 Multi-Sheet Workbook
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Menghasilkan berkas spreadsheet terstruktur dengan multi-sheet: Sheet Ringkasan KPI, Sheet Master Titik Billboard, 
              Sheet Historis Traffic Harian per Moda, dan Sheet Data Demografi & Audiens (SES).
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Cakupan export: <strong className="text-slate-800">{selectedCity === 'Semua' ? 'Semua Wilayah Nasional (23 Titik)' : `Kota ${selectedCity}`}</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">SheetJS XLSX Engine</span>
            <button
              onClick={handleQuickExportExcel}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Dataset Excel
            </button>
          </div>
        </Card>

      </div>

      {/* Spotlight Single Billboard Quick Export Box */}
      <Card className="p-4 bg-slate-50/80 border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Download className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">Export Spotlight Per-Billboard</div>
              <div className="text-[11px] text-slate-500">Pilih titik billboard spesifik untuk diunduh langsung sebagai profil mandiri</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <select
              value={spotlightBillboardId}
              onChange={(e) => setSpotlightBillboardId(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 font-medium max-w-[280px]"
            >
              {allBillboards.map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} - {b.nama} ({b.kota})
                </option>
              ))}
            </select>

            <button
              onClick={() => handleSpotlightExport('PDF')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Quick PDF
            </button>

            <button
              onClick={() => handleSpotlightExport('EXCEL')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Quick Excel
            </button>
          </div>
        </div>
      </Card>

      {/* Reports History Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Riwayat & Log Laporan yang Di-generate
              </h3>
              <p className="text-[11px] text-slate-500">
                Laporan disimpan di browser localStorage dan dapat diunduh ulang sewaktu-waktu
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            {reports.length} Catatan Laporan
          </div>
        </div>

        {/* History Table Component */}
        <ReportHistoryTable
          reports={reports}
          onPreview={(r) => setPreviewReport(r)}
          onDownloadPdf={handleDownloadPdfFromHistory}
          onDownloadExcel={handleDownloadExcelFromHistory}
          onDelete={handleDeleteReport}
          onClearAll={handleClearAll}
          onOpenCreateModal={() => setIsConfigModalOpen(true)}
        />

        <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Seluruh proses pembuatan PDF dan Excel berjalan langsung di sisi peramban (client-side) tanpa ketergantungan API backend.</span>
        </div>
      </Card>

      {/* Modals */}
      <ReportConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onGenerate={handleGenerateCustom}
        initialCity={selectedCity}
      />

      <ReportPreviewModal
        report={previewReport}
        onClose={() => setPreviewReport(null)}
        onDownloadPdf={handleDownloadPdfFromHistory}
        onDownloadExcel={handleDownloadExcelFromHistory}
      />

    </div>
  );
};

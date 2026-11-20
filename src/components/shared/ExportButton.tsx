import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { generatePdfReport } from '../../pages/reports/utils/exportPdf';
import { generateExcelReport } from '../../pages/reports/utils/exportExcel';
import { addReportToHistory } from '../../pages/reports/utils/historyStorage';
import { ReportConfig, GeneratedReportItem } from '../../pages/reports/types';
import { Billboard } from '../../types';

interface ExportButtonProps {
  billboard?: Billboard;
  city?: string;
  timeFilter?: 'harian' | 'mingguan' | 'bulanan';
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  billboard,
  city,
  timeFilter = 'mingguan',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: 'PDF' | 'EXCEL') => {
    setLoading(format);
    try {
      const isSingle = !!billboard;
      const isCity = !!city && city !== 'Semua';

      const config: ReportConfig = {
        title: isSingle 
          ? `Laporan Profil OOH — ${billboard.nama}` 
          : isCity 
            ? `Laporan Trafik OOH Wilayah ${city}` 
            : 'Laporan Trafik OOH Nasional',
        clientName: 'Mitra Pengiklan OOH',
        scopeType: isSingle ? 'single' : (isCity ? 'city' : 'all'),
        city: isCity ? city : undefined,
        billboardId: billboard?.id,
        timeRange: timeFilter,
        format,
        includeVehicleBreakdown: true,
        includeDemographics: true,
        includePoi: true,
        notes: isSingle ? `Ekspor langsung dari halaman detail billboard ${billboard.id}.` : undefined
      };

      let fileSize = '320 KB';
      let fName = '';
      if (format === 'PDF') {
        const res = await generatePdfReport(config);
        fileSize = res.fileSize;
        fName = res.fileName;
      } else {
        const res = await generateExcelReport(config);
        fileSize = res.fileSize;
        fName = res.fileName;
      }

      const reportId = `RPT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const scopeLabel = isSingle ? `${billboard.id} - ${billboard.nama}` : isCity ? `Kota ${city}` : 'Nasional';
      const timeRangeLabel = timeFilter === 'harian' ? 'Harian (1 Hari)' : timeFilter === 'mingguan' ? 'Mingguan (7 Hari)' : 'Bulanan (30 Hari)';

      const newReport: GeneratedReportItem = {
        id: reportId,
        title: config.title,
        clientName: config.clientName,
        format,
        scopeLabel,
        timeRangeLabel,
        generatedAt: new Date().toISOString(),
        fileSize,
        billboardCount: isSingle ? 1 : 23,
        config
      };

      addReportToHistory(newReport);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setLoading(null);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
              Pilih Format Export
            </div>

            <button
              disabled={loading !== null}
              onClick={() => handleExport('PDF')}
              className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {loading === 'PDF' ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <FileText className="w-4 h-4 text-blue-600" />
              )}
              <div>
                <div className="font-semibold">Dossier PDF</div>
                <div className="text-[10px] text-slate-400">Ringkasan visual proposal</div>
              </div>
            </button>

            <button
              disabled={loading !== null}
              onClick={() => handleExport('EXCEL')}
              className="w-full text-left px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {loading === 'EXCEL' ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              )}
              <div>
                <div className="font-semibold">Dataset Excel (XLSX)</div>
                <div className="text-[10px] text-slate-400">Multi-sheet raw data</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

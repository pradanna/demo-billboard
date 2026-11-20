import React from 'react';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Building2, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { GeneratedReportItem } from '../types';
import { getBillboards, getBillboardById, getTrafficByBillboard } from '../../../lib/mockData';

interface ReportPreviewModalProps {
  report: GeneratedReportItem | null;
  onClose: () => void;
  onDownloadPdf: (report: GeneratedReportItem) => void;
  onDownloadExcel: (report: GeneratedReportItem) => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  onClose,
  onDownloadPdf,
  onDownloadExcel
}) => {
  if (!report) return null;

  // Resolve billboards matching this report's config
  const config = report.config;
  let billboards = getBillboards();
  if (config.scopeType === 'city' && config.city) {
    billboards = getBillboards({ kota: config.city });
  } else if (config.scopeType === 'single' && config.billboardId) {
    const single = getBillboardById(config.billboardId);
    if (single) billboards = [single];
  }

  // Calculate quick summary
  const days = config.timeRange === 'harian' ? 1 : config.timeRange === 'mingguan' ? 7 : 30;
  let totalTraffic = 0;
  billboards.forEach(b => {
    const recs = getTrafficByBillboard(b.id, days);
    const avg = Math.round(recs.reduce((acc, r) => acc + (r.total || 0), 0) / recs.length);
    totalTraffic += avg;
  });

  const formattedDate = new Date(report.generatedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {report.id}
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Preview Ringkasan Laporan
              </h3>
              <p className="text-[11px] text-slate-500">
                Dibuat pada {formattedDate} WIB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Main Title & Client */}
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              {report.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 mt-2">
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Klien: <strong className="text-slate-900">{report.clientName}</strong>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Cakupan: <strong className="text-slate-900">{report.scopeLabel}</strong>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Periode: <strong className="text-slate-900">{report.timeRangeLabel}</strong>
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[11px]">Total Titik Billboard</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {billboards.length} Titik
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[11px]">Total Est. Trafik/Hari</div>
              <div className="text-lg font-extrabold text-blue-600 mt-0.5">
                {totalTraffic.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[11px]">Ukuran File</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {report.fileSize}
              </div>
            </div>
          </div>

          {/* Included Billboards */}
          <div>
            <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Sampel Titik Billboard Terpilih ({billboards.length} titik)</span>
              <span className="text-[11px] text-slate-400 font-normal">Menampilkan hingga 5 titik</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-semibold">ID</th>
                    <th className="py-2 px-3 font-semibold">Nama Billboard</th>
                    <th className="py-2 px-3 font-semibold">Kota</th>
                    <th className="py-2 px-3 font-semibold">Tipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                  {billboards.slice(0, 5).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-blue-600">{b.id}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{b.nama}</td>
                      <td className="py-2 px-3">{b.kota}</td>
                      <td className="py-2 px-3 text-slate-500">{b.tipe || 'DOOH Digital'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes if any */}
          {config.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <strong>Catatan Analis:</strong> {config.notes}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] text-slate-500">
            Klik tombol di sebelah kanan untuk men-download ulang berkas.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadPdf(report)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={() => onDownloadExcel(report)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Download Excel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

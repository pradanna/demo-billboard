import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Layers, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { GeneratedReportItem } from '../types';

interface ReportHistoryTableProps {
  reports: GeneratedReportItem[];
  onPreview: (report: GeneratedReportItem) => void;
  onDownloadPdf: (report: GeneratedReportItem) => void;
  onDownloadExcel: (report: GeneratedReportItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onOpenCreateModal: () => void;
}

export const ReportHistoryTable: React.FC<ReportHistoryTableProps> = ({
  reports,
  onPreview,
  onDownloadPdf,
  onDownloadExcel,
  onDelete,
  onClearAll,
  onOpenCreateModal
}) => {
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<'ALL' | 'PDF' | 'EXCEL'>('ALL');

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.scopeLabel.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());

    const matchesFormat = 
      formatFilter === 'ALL' || 
      (formatFilter === 'PDF' && (r.format === 'PDF' || r.format === 'BOTH')) ||
      (formatFilter === 'EXCEL' && (r.format === 'EXCEL' || r.format === 'BOTH'));

    return matchesSearch && matchesFormat;
  });

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 3600));

    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    return `${diffDays} hari yang lalu`;
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID, judul laporan, nama klien..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFormatFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                formatFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({reports.length})
            </button>
            <button
              onClick={() => setFormatFilter('PDF')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                formatFilter === 'PDF'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setFormatFilter('EXCEL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                formatFilter === 'EXCEL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Excel
            </button>
          </div>

          {reports.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat laporan?')) {
                  onClearAll();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
              title="Bersihkan Semua Riwayat"
            >
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        {filteredReports.length === 0 ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {search ? 'Tidak ada laporan yang cocok dengan pencarian' : 'Belum Ada Riwayat Laporan'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              {search 
                ? `Coba kata kunci lain atau reset filter format file.`
                : 'Laporan yang telah Anda generate dalam format PDF maupun Excel akan otomatis tercatat di sini.'}
            </p>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Generate Laporan Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Laporan & Klien</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Cakupan Wilayah</th>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">Waktu Generate</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Title & Client */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0 mt-0.5">
                          {report.id}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onPreview(report)}>
                            {report.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Target Klien: <span className="font-semibold text-slate-700">{report.clientName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Format Badge */}
                    <td className="py-3.5 px-4">
                      {report.format === 'PDF' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                          <FileText className="w-3 h-3" /> PDF
                        </span>
                      )}
                      {report.format === 'EXCEL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FileSpreadsheet className="w-3 h-3" /> XLSX
                        </span>
                      )}
                      {report.format === 'BOTH' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                          <Layers className="w-3 h-3" /> PDF + XLSX
                        </span>
                      )}
                    </td>

                    {/* Scope Label */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 truncate max-w-[200px]" title={report.scopeLabel}>
                        {report.scopeLabel}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {report.billboardCount} Titik Spot
                      </div>
                    </td>

                    {/* Period */}
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {report.timeRangeLabel}
                    </td>

                    {/* Generated At */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-medium">
                        {formatRelativeTime(report.generatedAt)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {report.fileSize}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPreview(report)}
                          title="Preview Ringkasan"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDownloadPdf(report)}
                          title="Unduh Berkas PDF"
                          className="p-1.5 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDownloadExcel(report)}
                          title="Unduh Berkas Excel"
                          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(report.id)}
                          title="Hapus dari Riwayat"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

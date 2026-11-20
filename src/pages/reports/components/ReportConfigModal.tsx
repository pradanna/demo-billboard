import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  Layers, 
  Sparkles, 
  Check, 
  Loader2, 
  Building2, 
  MapPin, 
  Calendar, 
  Users 
} from 'lucide-react';
import { ReportConfig, ReportFormat, ReportScopeType } from '../types';
import { getAllCities, getBillboards } from '../../../lib/mockData';

interface ReportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: ReportConfig) => Promise<void>;
  initialCity?: string;
  initialBillboardId?: string;
}

export const ReportConfigModal: React.FC<ReportConfigModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  initialCity = 'Semua',
  initialBillboardId
}) => {
  const allCities = getAllCities();
  const allBillboards = getBillboards();

  const [title, setTitle] = useState('Laporan Analisis Traffic & Demografi OOH');
  const [clientName, setClientName] = useState('PT Mitra Periklanan Indonesia');
  const [scopeType, setScopeType] = useState<ReportScopeType>(
    initialBillboardId ? 'single' : (initialCity !== 'Semua' ? 'city' : 'all')
  );
  const [selectedCity, setSelectedCity] = useState(initialCity !== 'Semua' ? initialCity : allCities[0]);
  const [selectedBillboardId, setSelectedBillboardId] = useState(initialBillboardId || allBillboards[0]?.id || 'BB-001');
  const [timeRange, setTimeRange] = useState<'harian' | 'mingguan' | 'bulanan'>('mingguan');
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [includeVehicleBreakdown, setIncludeVehicleBreakdown] = useState(true);
  const [includeDemographics, setIncludeDemographics] = useState(true);
  const [includePoi, setIncludePoi] = useState(true);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await onGenerate({
        title,
        clientName,
        scopeType,
        city: scopeType === 'city' ? selectedCity : undefined,
        billboardId: scopeType === 'single' ? selectedBillboardId : undefined,
        timeRange,
        format,
        includeVehicleBreakdown,
        includeDemographics,
        includePoi,
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Konfigurasi & Generate Laporan Kustom
              </h3>
              <p className="text-xs text-slate-500">
                Pilih cakupan data titik billboard, periode waktu, dan format file export
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Judul & Nama Klien */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Judul Laporan
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Proposal Kampanye Q1 Jakarta"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Klien / Nama Agensi
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Contoh: PT Unilever Indonesia Tbk"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Cakupan Data (Scope) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Cakupan Data Billboard
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setScopeType('all')}
                className={`py-2 px-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                  scopeType === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Semua ({allBillboards.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeType('city')}
                className={`py-2 px-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                  scopeType === 'city'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Per Kota
              </button>
              <button
                type="button"
                onClick={() => setScopeType('single')}
                className={`py-2 px-3 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                  scopeType === 'single'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Titik Tertentu
              </button>
            </div>

            {/* Scope Sub-selection */}
            {scopeType === 'city' && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 shrink-0">Pilih Kota:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {allCities.map((city) => (
                    <option key={city} value={city}>
                      {city} ({allBillboards.filter(b => b.kota === city).length} Titik)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scopeType === 'single' && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 shrink-0">Pilih Billboard:</span>
                <select
                  value={selectedBillboardId}
                  onChange={(e) => setSelectedBillboardId(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {allBillboards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} - {b.nama} ({b.kota})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Rentang Waktu (Time Range) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Rentang Waktu Analisis
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'harian', label: 'Harian (1 Hari)', desc: 'Snapshot volume terkini' },
                { id: 'mingguan', label: 'Mingguan (7 Hari)', desc: 'Rerata traffic 1 minggu (Default)' },
                { id: 'bulanan', label: 'Bulanan (30 Hari)', desc: 'Tren jangka menengah 1 bulan' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setTimeRange(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    timeRange === opt.id
                      ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/30'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Export */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Format File Export
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormat('PDF')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'PDF'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <FileText className="w-4 h-4" />
                  </span>
                  {format === 'PDF' && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">PDF Dossier</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Proposal visual siap dikirim ke klien
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('EXCEL')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'EXCEL'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <FileSpreadsheet className="w-4 h-4" />
                  </span>
                  {format === 'EXCEL' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Excel (XLSX)</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Multi-sheet tabular data mentah
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('BOTH')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  format === 'BOTH'
                    ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                    <Layers className="w-4 h-4" />
                  </span>
                  {format === 'BOTH' && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">PDF + Excel</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Paket lengkap visual & dataset
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Opsi Konten */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Elemen Konten Laporan
            </label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVehicleBreakdown}
                  onChange={(e) => setIncludeVehicleBreakdown(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">
                  Rincian Volume per Moda Transportasi (Sepeda Motor, Mobil, Pejalan Kaki, Truk/Bus)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDemographics}
                  onChange={(e) => setIncludeDemographics(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">
                  Analisis Profil Demografi Sekitar Titik (Radius 1 KM, Kepadatan, SES & Distribusi Usia)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePoi}
                  onChange={(e) => setIncludePoi(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">
                  Titik Keramaian Terdekat / POI (Mall, Stasiun MRT/LRT, Perkantoran)
                </span>
              </label>
            </div>
          </div>

          {/* Catatan Tambahan (Opsional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan Khusus Analis / Rekomendasi (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan khusus untuk proposal klien ini..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isGenerating}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengenerate File...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate & Download Laporan
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

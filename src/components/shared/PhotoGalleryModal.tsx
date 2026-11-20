import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Sun, 
  Moon, 
  Eye, 
  Maximize2, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { Billboard } from '../../types';
import billboardPhotoSample from '../../assets/billboard-photo-sample.png';

interface PhotoGalleryModalProps {
  billboard: Billboard;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  billboard,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'day' | 'night' | 'driver'>('day');

  if (!isOpen) return null;

  // Demo: dokumentasi lapangan nyata (foto siang/malam/sudut pengendara
  // sebaiknya diisi per-titik billboard bila tersedia; untuk demo ini ketiga
  // tab memakai foto sampel yang sama).
  const photoDay = billboard.foto || billboardPhotoSample;
  const photoNight = billboard.foto || billboardPhotoSample;
  const photoDriver = billboard.foto || billboardPhotoSample;

  const activePhoto = activeTab === 'day' ? photoDay : activeTab === 'night' ? photoNight : photoDriver;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {billboard.id}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Dokumentasi Visual & Sudut Pandang Titik
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {billboard.nama} — {billboard.alamat}, {billboard.kota}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo Viewport */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {/* Angle View Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('day')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'day'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Penampakan Siang Hari
            </button>
            <button
              onClick={() => setActiveTab('night')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'night'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Pencahayaan Malam Hari
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'driver'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Sudut Pandang Pengendara (150m)
            </button>
          </div>

          {/* Main Photo Preview */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            <img 
              src={activePhoto} 
              alt={billboard.nama} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  {activeTab === 'day' ? 'Daylight Visibility' : activeTab === 'night' ? 'Night LED Illumination' : 'Driver Perspective'}
                </span>
                <div className="text-sm font-bold mt-1">{billboard.arahPandang || 'Menghadap Arus Utama Lalu Lintas'}</div>
              </div>
              <div className="text-xs text-white/90 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-lg">
                Ukuran: {billboard.ukuran || '12m x 24m'}
              </div>
            </div>
          </div>

          {/* Specs & Data Methodology Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-blue-600" />
                Spesifikasi Fisik Media
              </div>
              <div className="text-slate-600">
                Format: <strong className="text-slate-800">{billboard.tipe || 'DOOH LED'}</strong>
              </div>
              <div className="text-slate-600">
                Dimensi: <strong className="text-slate-800">{billboard.ukuran || '12m x 24m'}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Metodologi & Validasi Data
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Data traffic dihitung berbasis <em>Aggregated Cellular Movement & GPS Mobility Telemetry</em> secara anonim tanpa perekaman video pribadi (UU PDP Compliant).
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
          >
            Tutup Galeri
          </button>
        </div>

      </div>
    </div>
  );
};

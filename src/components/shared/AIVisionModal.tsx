import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scan, 
  CheckCircle2, 
  Bike, 
  Car, 
  Footprints, 
  Truck,
  Activity
} from 'lucide-react';
import { Billboard } from '../../types';
import cctvLiveSample from '../../assets/cctv-live-sample.png';

interface AIVisionModalProps {
  billboard: Billboard;
  isOpen: boolean;
  onClose: () => void;
}

export const AIVisionModal: React.FC<AIVisionModalProps> = ({
  billboard,
  isOpen,
  onClose
}) => {
  const [fps, setFps] = useState(29.8);
  const [latency, setLatency] = useState(13.4);
  const [frameCounter, setFrameCounter] = useState(14820);
  const [detectionsCount, setDetectionsCount] = useState(16);

  // Simulasi statistik HUD live (feed kamera memakai foto sampel nyata
  // yang sudah berisi bounding box hasil deteksi, lihat cctvLiveSample).
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setFrameCounter(f => f + 1);
      setFps(29.2 + Math.random() * 1.5);
      setLatency(12 + Math.random() * 3);
      setDetectionsCount(14 + Math.floor(Math.random() * 8));
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Live Edge AI CCTV Computer Vision
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  YOLOv11-OOH Inference Live
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Deteksi otomatis pergerakan moda di {billboard.nama} ({billboard.kota})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Camera Frame */}
        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-200">
          <img 
            src={cctvLiveSample} 
            alt="Live CCTV AI computer vision feed" 
            className="w-full h-full object-cover filter brightness-95"
          />

          {/* Top HUD */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                CAM-01 [STREET_MAIN]
              </span>
              <span className="hidden sm:inline text-slate-300">1920x1080 @ {fps.toFixed(1)} FPS</span>
              <span className="text-slate-300">LATENCY: {latency.toFixed(1)}ms</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-slate-400">FRAME #{frameCounter}</span>
              <span className="text-emerald-400 font-semibold">{detectionsCount} OBJEK AKTIF</span>
            </div>
          </div>

          {/* Bottom HUD Counter */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs bg-white/95 backdrop-blur-md text-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 sm:gap-4 font-semibold text-[11px] sm:text-xs">
              <span className="flex items-center gap-1 text-emerald-600">
                <Bike className="w-3.5 h-3.5" /> Motor
              </span>
              <span className="flex items-center gap-1 text-blue-600">
                <Car className="w-3.5 h-3.5" /> Mobil
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <Footprints className="w-3.5 h-3.5" /> Pedestrian
              </span>
              <span className="flex items-center gap-1 text-purple-600">
                <Truck className="w-3.5 h-3.5" /> Truk
              </span>
            </div>
            <div className="text-[11px] font-bold text-blue-700 font-mono">
              OTS LIVE COUNTER
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Sensor kamera AI Edge mendeteksi objek secara anonim tanpa menyimpan rekaman pribadi (GDPR & PDP Compliant).
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Tutup Live Feed
          </button>
        </div>

      </div>
    </div>
  );
};

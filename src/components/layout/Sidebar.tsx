import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Layers, 
  FileText, 
  Radio
} from 'lucide-react';

interface SidebarProps {
  totalBillboardsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ totalBillboardsCount = 33 }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 shrink-0 hidden lg:flex flex-col min-h-screen">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
            NEX<span className="text-blue-600">TRAFFIC</span>
          </h1>
          <p className="text-[11px] font-medium text-slate-400">
            Billboard Intelligence
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
        
        {/* Section 1: Monitoring */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Monitoring & Peta
          </div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Peta</span>
            </div>
          </NavLink>

          <NavLink
            to="/billboard"
            className={({ isActive }) =>
              `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" />
              <span>Daftar Billboard</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalBillboardsCount}
            </span>
          </NavLink>
        </div>

        {/* Section 2: Analysis & Media */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Analisis & Media
          </div>

          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Perbandingan Titik</span>
            </div>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>Laporan & Export</span>
            </div>
          </NavLink>
        </div>

      </div>

      {/* User Role Profile Badge */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
            P
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-400 leading-none">Pengguna Aktif</div>
            <div className="text-xs font-bold text-slate-800 truncate">Pradana (Owner)</div>
          </div>
        </div>
      </div>

    </aside>
  );
};

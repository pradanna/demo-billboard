import React from 'react';
import { Search, Bell, MapPin, Radio, Menu } from 'lucide-react';
import { getAllCities } from '../../lib/mockData';

interface TopBarProps {
  title?: string;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = "Ringkasan Infrastruktur Billboard",
  selectedCity = "Semua",
  onCityChange,
  onToggleMobileMenu
}) => {
  const cities = ["Semua", ...getAllCities()];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Title */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button 
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 hidden sm:flex items-center justify-center text-slate-700 text-xs font-bold font-mono">
            13
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
        </div>

        {/* Right: Search, Filter, Notification & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Search Pill */}
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari titik billboard, kota..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* City Filter Dropdown Pill */}
          {onCityChange && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs text-slate-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-xs font-semibold text-slate-800"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city === 'Semua' ? 'Nasional (Semua Kota)' : city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notification */}
          <button className="relative p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {/* User Profile Avatar */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              P
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 leading-none">Peran Aktif</div>
              <div className="text-xs font-bold text-slate-800 leading-tight">Pradana (Owner)</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
